
import React, { useState, useEffect, useCallback } from 'react';
import { KOREAN_MONTH_NAMES, KOREAN_DAY_NAMES_SHORT } from '../constants';
import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { marked } from 'marked';
import { useApiKey } from '../contexts/ApiKeyContext';


const PrevIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const NextIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CheckIconMini: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

const SpinnerIconMini: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-500 ${className}`}></div>
);

const PendingIconMini: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`h-4 w-4 rounded-full border-2 border-slate-500 ${className}`}></div>
);


interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
}

interface CalendarProps {
  scheduleText: string;
  manualContextText?: string;
}

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const loadingMessages = [
  "요청 분석 중...",
  "관련 정보 검색 중 (Google Search)...",
  "업무 절차 및 K-에듀파인 연관성 검토 중...",
  "학교행정업무매뉴얼 내용 검토 중...",
  "답변 초안 생성 중...",
  "내용 최종 검토 및 요약 중..."
];

const Calendar: React.FC<CalendarProps> = ({ scheduleText, manualContextText }) => {
  const { apiKey } = useApiKey();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDescriptions, setEventDescriptions] = useState<Record<string, string>>({});
  const [eventGrounding, setEventGrounding] = useState<Record<string, GroundingChunk[]>>({});
  const [isGeneratingDescription, setIsGeneratingDescription] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());


  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("API key is not set. AI features will be disabled.");
  }

  useEffect(() => {
    const parseScheduleData = (textData: string) => {
      setIsLoadingSchedule(true);
      setScheduleError(null);
      
      const currentSystemYear = new Date().getFullYear();
      const endYear = 2029; // Display events up to this year
      const newEvents: CalendarEvent[] = [];
      let eventIdCounter = 1;

      if (!textData || textData.trim() === '') {
        setScheduleError("제공된 일정 데이터가 비어있습니다.");
        setEvents([]);
        setIsLoadingSchedule(false);
        return;
      }

      const lines = textData.split('\n').filter(line => line.trim() !== '');

      if (lines.length === 0) {
        setScheduleError("일정 데이터에 파싱할 내용이 없습니다.");
        setEvents([]);
        setIsLoadingSchedule(false);
        return;
      }

      lines.forEach((line, lineIndex) => {
        const parts = line.split(';').map(part => part.trim());
        if (parts.length === 3) {
          const monthStr = parts[0];
          const dayStr = parts[1];
          const titlesStr = parts[2];

          const monthMatch = monthStr.match(/(\d+)월/);
          const dayMatch = dayStr.match(/(\d+)일/);

          if (monthMatch && dayMatch && titlesStr) {
            const monthIdx = parseInt(monthMatch[1], 10) - 1; // 0-indexed month
            const day = parseInt(dayMatch[1], 10);

            if (monthIdx >= 0 && monthIdx < 12 && day > 0 && day <= 31) { 
              const eventTitles = titlesStr.split(',').map(title => title.trim()).filter(title => title);
              
              for (let yearToCreate = currentSystemYear; yearToCreate <= endYear; yearToCreate++) {
                eventTitles.forEach(title => {
                  const eventDate = new Date(yearToCreate, monthIdx, day);
                  if (eventDate.getFullYear() === yearToCreate && eventDate.getMonth() === monthIdx && eventDate.getDate() === day) {
                    newEvents.push({
                      id: `event-${yearToCreate}-${monthIdx + 1}-${day}-${title.substring(0,10).replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣-]/g, '')}-${eventIdCounter++}`,
                      date: formatDateKey(eventDate),
                      title: title,
                    });
                  }
                });
              }
            } else {
              console.warn(`Invalid date components (month or day out of range) in schedule data on line ${lineIndex + 1}: ${line}`);
            }
          } else {
            console.warn(`Invalid format (month/day regex mismatch) in schedule data on line ${lineIndex + 1}: ${line}`);
          }
        } else if (line.trim()) { 
          console.warn(`Skipping malformed line (expected 3 parts separated by ';') in schedule data on line ${lineIndex + 1}: ${line}`);
        }
      });
      
      setEvents(newEvents);

      if (lines.length > 0 && newEvents.length === 0) {
        setScheduleError("제공된 일정 데이터에서 유효한 일정을 찾지 못했습니다. 데이터 형식(예: 1월 ; 1일 ; 내용)을 확인해주세요.");
      }
      setIsLoadingSchedule(false);
    };

    parseScheduleData(scheduleText);
  }, [scheduleText]); 


  useEffect(() => {
    let timer: number | undefined;
    if (isGeneratingDescription && loadingStep < loadingMessages.length) {
      const randomDuration = 1300 + Math.random() * 1500; 
      timer = window.setTimeout(() => {
        setLoadingStep(prevStep => prevStep + 1);
      }, randomDuration);
    }
    return () => clearTimeout(timer);
  }, [isGeneratingDescription, loadingStep]);

  const changeMonth = (offset: number): void => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(1); 
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
    setExpandedDays(new Set()); 
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 

  const today = new Date();

  const fetchEventDescription = useCallback(async (event: CalendarEvent) => {
    if (!ai) {
      setGenerationError("AI 기능을 사용할 수 없습니다. API 키가 설정되지 않았습니다.");
      setIsGeneratingDescription(false);
      return;
    }
    if (eventDescriptions[event.id]) { 
        setIsGeneratingDescription(false); 
        return;
    }

    setIsGeneratingDescription(true);
    setLoadingStep(0); 
    setGenerationError(null);
    try {
      let prompt = `다음 달력 일정에 대해 설명해주세요: '${event.title}'.
응답은 다음 최대 세 부분으로 명확히 구분하여 작성해주세요 (해당하는 내용이 없을 경우 해당 부분은 생략 가능합니다):

1.  **업무/일정 설명**: 이 업무 또는 일정에 대한 자세한 설명을 제공해주세요. (3-4 문장)
2.  **업무처리절차**: 이 업무 또는 일정을 처리하기 위한 단계별 절차를 상세히 설명해주세요. **신규 사용자도 쉽게 따라 할 수 있도록 매우 상세한 단계별 가이드**로 작성해주세요. 각 단계는 명확한 행동 지침(예: "1. [시스템명/프로그램명] 시스템에 로그인합니다.", "2. 상단 메뉴에서 [메뉴명] > [하위 메뉴명]을 선택하여 해당 화면으로 이동합니다.", "3. [버튼명] 버튼을 클릭합니다.", "4. 필요한 정보를 각 항목에 맞게 입력하거나 선택합니다.", "5. 모든 정보 입력 후 [저장] 또는 [결재요청] 버튼을 클릭하여 작업을 완료합니다.")을 포함해야 합니다.
    정보를 찾을 때 다음의 우선순위에 따라 웹 검색을 활용해주세요:
        1. 학교 회계 또는 해당 업무 처리 매뉴얼, 강의를 다루는 YouTube 영상
        2. 업무 처리 절차를 설명하는 블로그 게시물
        3. 기타 공신력 있거나 매우 관련성 높은 웹 페이지
    K-에듀파인 또는 NEIS 시스템에서의 작업이 포함된다면, 해당 시스템에서의 구체적인 메뉴 경로와 작업 단계를 포함하여 최신 정보를 반영해주세요. 만약 특정 시스템과 직접적인 관련이 없는 일반적인 행정 절차라면 해당 절차를 설명해주세요. 시스템 관련 작업이 전혀 없다면 "해당 없음" 또는 "특정 시스템을 사용하는 절차가 확인되지 않는 일반 업무입니다." 라고 명확히 명시해주세요.`;

      if (manualContextText) {
        prompt += `
3.  **학교행정업무매뉴얼 참조**: 제공된 아래의 학교행정업무매뉴얼 목차를 참고하여, 현재 설명하는 '${event.title}' 업무/일정과 관련된 내용이 있다면 해당 매뉴얼의 편, 장, 절, 페이지 번호 등을 인용하여 언급해주세요. 관련 내용이 없다면 이 항목은 생략하거나 "관련 내용 없음"으로 표시해주세요.

--- 학교행정업무매뉴얼 목차 시작 ---
${manualContextText}
--- 학교행정업무매뉴얼 목차 끝 ---`;
      }

      prompt += `

답변은 Google 검색 결과를 참고하여 최신 정보를 반영하고, 명확하고 이해하기 쉽게 한국어로 작성해주세요. Markdown 형식을 사용하여 목록이나 강조 등을 적절히 활용해주세요.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 3000 },
          tools: [{ googleSearch: {} }],
        },
      });
      
      const description = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      if (description) {
        setEventDescriptions(prev => ({ ...prev, [event.id]: description }));
      } else {
        setGenerationError("AI로부터 유효한 설명을 받지 못했습니다.");
      }

      if (groundingChunks && groundingChunks.length > 0) {
        setEventGrounding(prev => ({ ...prev, [event.id]: groundingChunks }));
      }

    } catch (error) {
      console.error("Error generating event description:", error);
      let errorMessage = "설명 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            errorMessage = "API 키가 유효하지 않습니다. 확인해주세요.";
        } else if (error.message.includes("quota")) {
            errorMessage = "API 사용량 할당량을 초과했습니다.";
        }
      }
      setGenerationError(errorMessage);
    } finally {
      setIsGeneratingDescription(false);
      if (loadingStep < loadingMessages.length -1) { 
        setLoadingStep(loadingMessages.length); 
      }
    }
  }, [ai, eventDescriptions, loadingStep, manualContextText]);


  const handleEventClick = (event: CalendarEvent): void => {
    setSelectedEvent(event);
    setGenerationError(null); 
    if (!eventDescriptions[event.id] && ai) {
      setLoadingStep(0); 
      fetchEventDescription(event);
    } else if (eventDescriptions[event.id]) {
        setIsGeneratingDescription(false); 
    } else if (!ai) {
        setIsGeneratingDescription(false);
    }
  };

  const toggleDayExpansion = (dateKey: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  const renderHeader = (): React.ReactNode => (
    <div className="flex-shrink-0 flex justify-between items-center mb-4 sm:mb-6 px-1 sm:px-2">
      <button 
        onClick={() => changeMonth(-1)} 
        className="p-2 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-colors group"
        aria-label="Previous month"
      >
        <PrevIcon />
      </button>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide">
        {year}년 {KOREAN_MONTH_NAMES[month]}
      </h2>
      <button 
        onClick={() => changeMonth(1)} 
        className="p-2 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-colors group"
        aria-label="Next month"
      >
        <NextIcon />
      </button>
    </div>
  );

  const renderDaysOfWeek = (): React.ReactNode => (
    <div className="flex-shrink-0 grid grid-cols-7 gap-1 sm:gap-2 mb-2 px-1">
      {KOREAN_DAY_NAMES_SHORT.map(day => (
        <div key={day} className="text-center font-medium text-xs sm:text-sm text-slate-400 uppercase">
          {day}
        </div>
      ))}
    </div>
  );

  const renderCalendarCells = (): React.ReactNode => {
    const blanks = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      blanks.push(<div key={`blank-${i}`} className="border border-transparent rounded-lg"></div>);
    }

    const days = [];
    const MAX_EVENTS_VISIBLE = 3; 

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const cellDate = new Date(year, month, day);
      const dateKey = formatDateKey(cellDate);
      const dayEvents = events.filter(event => event.date === dateKey);
      const isExpanded = expandedDays.has(dateKey);
      const eventsToShow = isExpanded ? dayEvents : dayEvents.slice(0, MAX_EVENTS_VISIBLE);

      days.push(
        <div
          key={day}
          aria-label={`${KOREAN_MONTH_NAMES[month]} ${day}일, ${year}. ${dayEvents.length}개의 이벤트.`}
          className={`
            p-2 border rounded-lg 
            flex flex-col items-start justify-start 
            text-left 
            transition-all duration-200 ease-in-out transform
            min-h-[80px] sm:min-h-[100px] 
            ${isToday 
              ? 'bg-cyan-600/20 border-cyan-500 shadow-xl scale-[1.01]'
              : 'bg-slate-700 border-slate-600 shadow-lg hover:bg-slate-600/70 hover:shadow-2xl hover:scale-[1.01]'
            }
          `}
        >
          <span className={`
            text-xs sm:text-sm font-medium self-end
            ${isToday ? 'text-cyan-100 font-bold' : 'text-slate-400'}
          `}>
            {day}
          </span>
          <div className="w-full mt-1 space-y-1 overflow-y-auto flex-grow flex flex-col">
            {eventsToShow.map((event) => (
              <button 
                key={event.id} 
                onClick={() => handleEventClick(event)}
                className="text-left w-full text-xs p-1 bg-teal-800/70 hover:bg-teal-700/70 rounded text-teal-100 truncate transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                title={event.title}
                aria-label={`일정: ${event.title}. 상세보기`}
              >
                {event.title}
              </button>
            ))}
            {!isExpanded && dayEvents.length > MAX_EVENTS_VISIBLE && (
              <button 
                onClick={() => toggleDayExpansion(dateKey)}
                className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 py-0.5 w-full text-center rounded hover:bg-slate-600/50 transition-colors"
                aria-label={`${dayEvents.length - MAX_EVENTS_VISIBLE}개 일정 더 보기`}
              >
                +{dayEvents.length - MAX_EVENTS_VISIBLE}개 더보기
              </button>
            )}
            {isExpanded && dayEvents.length > MAX_EVENTS_VISIBLE && (
              <button 
                onClick={() => toggleDayExpansion(dateKey)}
                className="text-xs text-slate-400 hover:text-slate-300 mt-1 py-0.5 w-full text-center rounded hover:bg-slate-600/50 transition-colors"
                aria-label="일정 간략히 보기"
              >
                간략히 보기
              </button>
            )}
             {dayEvents.length === 0 && <div className="flex-grow"></div>}
          </div>
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1 sm:gap-1.5 place-items-stretch flex-1">{[...blanks, ...days]}</div>;
  };

  const renderEventModal = (): React.ReactNode => {
    if (!selectedEvent) return null;

    const descriptionText = eventDescriptions[selectedEvent.id];
    const groundingChunksForEvent = eventGrounding[selectedEvent.id];

    let section1Title = "업무/일정 설명";
    let section1Content = "";
    let section2Title = "업무처리절차";
    let section2Content = "";
    let section3Title = "학교행정업무매뉴얼 참조";
    let section3Content = "";
    let otherContent = "";

    if (descriptionText) {
        const text = descriptionText;
        
        const s1HeaderMatch = text.match(/1\.\s*(?:\*\*)?업무\/일정 설명(?:\*\*)?:?/i);
        const s2HeaderMatch = text.match(/2\.\s*(?:\*\*)?업무처리절차(?:\*\*)?:?/i);
        const s3HeaderMatch = text.match(/3\.\s*(?:\*\*)?학교행정업무매뉴얼 참조(?:\*\*)?:?/i);

        let s1StartIdx = s1HeaderMatch ? (s1HeaderMatch.index || 0) + s1HeaderMatch[0].length : -1;
        let s2StartIdx = s2HeaderMatch ? (s2HeaderMatch.index || 0) + s2HeaderMatch[0].length : -1;
        let s3StartIdx = s3HeaderMatch ? (s3HeaderMatch.index || 0) + s3HeaderMatch[0].length : -1;
        
        // Determine end points for each section
        let s1EndIdx = text.length;
        if (s2HeaderMatch && (s2HeaderMatch.index || 0) > s1StartIdx && s1StartIdx !== -1) s1EndIdx = Math.min(s1EndIdx, s2HeaderMatch.index || 0);
        if (s3HeaderMatch && (s3HeaderMatch.index || 0) > s1StartIdx && s1StartIdx !== -1) s1EndIdx = Math.min(s1EndIdx, s3HeaderMatch.index || 0);

        let s2EndIdx = text.length;
        if (s3HeaderMatch && (s3HeaderMatch.index || 0) > s2StartIdx && s2StartIdx !== -1) s2EndIdx = Math.min(s2EndIdx, s3HeaderMatch.index || 0);

        if (s1StartIdx !== -1) {
            section1Content = text.substring(s1StartIdx, s1EndIdx).trim();
        }
        if (s2StartIdx !== -1 && (!s1HeaderMatch || (s2HeaderMatch?.index || 0) >= s1EndIdx)) {
             section2Content = text.substring(s2StartIdx, s2EndIdx).trim();
        }
         if (s3StartIdx !== -1 && (!s2HeaderMatch || (s3HeaderMatch?.index || 0) >= s2EndIdx)) {
            section3Content = text.substring(s3StartIdx).trim();
        }

        if (!s1HeaderMatch && !s2HeaderMatch && !s3HeaderMatch && text) {
            otherContent = text.trim();
        } else if (s1HeaderMatch && !section1Content && !section2Content && !section3Content) {
           // If only S1 header found, S1 content is the rest of the string from S1 header
           if (s1StartIdx !== -1) section1Content = text.substring(s1StartIdx).trim();
        }
    }
    
    // Function to render markdown content for modal
    const renderMarkdownModal = (markdownText: string) => {
        if (!markdownText) return null;
        const rawHtml = marked.parse(markdownText, { breaks: true, gfm: true }) as string;
        // Basic styling for lists, can be expanded
        const styledHtml = rawHtml
            .replace(/<ul>/g, '<ul class="list-disc list-outside ml-5 space-y-1">')
            .replace(/<ol>/g, '<ol class="list-decimal list-outside ml-5 space-y-1">')
            .replace(/<li>/g, '<li class="text-sm text-slate-300 leading-relaxed">')
            .replace(/<p>/g, '<p class="text-sm text-slate-300 leading-relaxed mb-2">')
            .replace(/<strong>/g, '<strong class="font-semibold text-slate-200">')
            .replace(/<h3>/g, '<h3 class="text-base font-semibold text-cyan-300 mt-2 mb-1">')
            .replace(/<h4>/g, '<h4 class="text-sm font-semibold text-cyan-300 mt-1 mb-1">');
        return <div dangerouslySetInnerHTML={{ __html: styledHtml }} />;
    };


    return (
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={() => setSelectedEvent(null)} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
      >
        <div 
          className="bg-slate-800 p-5 sm:p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-slate-100 border border-slate-700"
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="flex justify-between items-start mb-4 flex-shrink-0 gap-3">
            <div className="min-w-0">
              <h3 id="event-modal-title" className="text-lg font-semibold text-cyan-400 truncate">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">AI 보고서</p>
            </div>
            <button 
              onClick={() => setSelectedEvent(null)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-700"
              aria-label="팝업 닫기"
            >
              <CloseIcon/>
            </button>
          </div>
          
          <div className="overflow-y-auto flex-grow pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-700 hover:scrollbar-thumb-blue-600 active:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-md">
            {isGeneratingDescription && !descriptionText && !generationError && (
              <div className="text-sm text-slate-300 py-4">
                <ul className="space-y-2.5">
                  {loadingMessages.map((message, index) => (
                    <li key={index} className="flex items-center space-x-2.5">
                      {index < loadingStep ? (
                        <CheckIconMini className="text-green-500 flex-shrink-0" />
                      ) : index === loadingStep && isGeneratingDescription ? (
                        <SpinnerIconMini className="flex-shrink-0" /> 
                      ) : (
                        <PendingIconMini className="text-slate-500 flex-shrink-0" />
                      )}
                      <span className={`${index < loadingStep ? 'text-slate-500 line-through' : (index === loadingStep && isGeneratingDescription) ? 'text-cyan-400 font-medium' : 'text-slate-400'}`}>
                        {message}
                      </span>
                    </li>
                  ))}
                </ul>
                 {loadingStep >= loadingMessages.length && isGeneratingDescription && ( 
                    <div className="flex items-center space-x-2.5 mt-3">
                        <SpinnerIconMini className="flex-shrink-0" />
                        <span className="text-cyan-400 font-medium">마무리 중...</span>
                    </div>
                )}
              </div>
            )}
            {generationError && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-700 p-3 rounded-md">
                <p className="font-semibold mb-1">오류</p>
                {generationError}
              </div>
            )}

            {descriptionText && !generationError && (
              <>
                {otherContent && (
                    <div className="prose prose-sm prose-invert max-w-none chatbot-message-content">
                        {renderMarkdownModal(otherContent)}
                    </div>
                )}
                {section1Content && (
                    <div className="mb-4">
                        <h4 className="text-md font-semibold text-cyan-400 mb-1.5">{section1Title}</h4>
                         <div className="prose prose-sm prose-invert max-w-none chatbot-message-content">
                            {renderMarkdownModal(section1Content)}
                        </div>
                    </div>
                )}
                {section2Content && (
                    <div className="mb-4">
                        <h4 className="text-md font-semibold text-cyan-400 mb-1.5">{section2Title}</h4>
                        <div className="prose prose-sm prose-invert max-w-none chatbot-message-content">
                           {renderMarkdownModal(section2Content)}
                        </div>
                    </div>
                )}
                {section3Content && (
                    <div className="mb-4">
                        <h4 className="text-md font-semibold text-cyan-400 mb-1.5">{section3Title}</h4>
                        <div className="prose prose-sm prose-invert max-w-none chatbot-message-content">
                            {renderMarkdownModal(section3Content)}
                        </div>
                    </div>
                )}
                
                {groundingChunksForEvent && groundingChunksForEvent.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-700">
                    <h4 className="text-xs font-semibold text-slate-400 mb-2">참고 자료 (Google 검색):</h4>
                    <ul className="space-y-1.5">
                      {groundingChunksForEvent.map((chunk, index) => {
                        if (chunk.web && chunk.web.uri) {
                          return (
                            <li key={index} className="text-xs">
                              <a 
                                href={chunk.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cyan-500 hover:text-cyan-400 hover:underline"
                                title={chunk.web.title || chunk.web.uri}
                              >
                                {chunk.web.title || chunk.web.uri}
                              </a>
                            </li>
                          );
                        }
                        return null;
                      }).filter(Boolean)}
                    </ul>
                  </div>
                )}
              </>
            )}
            {!apiKey && (!selectedEvent?.id || (!eventDescriptions[selectedEvent!.id] && !isGeneratingDescription && !generationError)) && (
              <div className="text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-700 p-3 rounded-md mt-3">
                  AI 기능을 사용하려면 API 키가 필요합니다. 현재 설정되어 있지 않습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="bg-slate-800 px-4 sm:px-6 py-3 sm:py-5 rounded-xl shadow-2xl flex flex-col w-full h-full border border-slate-700">
      {renderHeader()}
      
      {isLoadingSchedule && (
        <div className="text-center p-2 text-sm text-cyan-400 my-1">일정 데이터를 로딩 중입니다...</div>
      )}
      {scheduleError && !isLoadingSchedule && (
        <div className="text-center p-2 text-sm text-red-400 bg-red-900/30 rounded-md my-1">
          <p className="font-semibold">일정 로드 오류:</p>
          <p>{scheduleError}</p>
          <p className="text-xs mt-1">앱 코드 내 일정 데이터 형식을 확인해주세요.</p>
        </div>
      )}
      {!isLoadingSchedule && !scheduleError && events.length === 0 && (
           <div className="text-center p-2 text-sm text-slate-400 my-1">
              표시할 일정이 없습니다. 앱 코드 내에 일정을 추가해주세요.
          </div>
      )}

      {renderDaysOfWeek()}
      {renderCalendarCells()}
      {renderEventModal()}
    </div>
  );
};

export default Calendar;
