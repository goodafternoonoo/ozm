// 로깅 레벨 정의
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

// 로깅 카테고리 정의
export enum LogCategory {
    AUTH = 'AUTH',
    API = 'API',
    LOCATION = 'LOCATION',
    RECOMMENDATION = 'RECOMMENDATION',
    USER_INTERACTION = 'USER_INTERACTION',
    UI = 'UI',
    SYSTEM = 'SYSTEM',
}

// 로깅 설정 인터페이스
interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableFile?: boolean;
    enableRemote?: boolean;
}

// 로그 엔트리 인터페이스
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    category: LogCategory;
    message: string;
    data?: any;
    error?: Error;
}

class Logger {
    private config: LoggerConfig;
    private static instance: Logger;

    private constructor() {
        // 환경별 로깅 설정
        this.config = {
            level: __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR,
            enableConsole: true,
            enableFile: false, // 필요시 파일 로깅 활성화
            enableRemote: false, // 필요시 원격 로깅 활성화
        };
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    // 로깅 레벨 설정
    public setLevel(level: LogLevel): void {
        this.config.level = level;
    }

    // 설정 업데이트
    public updateConfig(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    // 로그 메시지 생성
    private createLogEntry(
        level: LogLevel,
        category: LogCategory,
        message: string,
        data?: any,
        error?: Error
    ): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            category,
            message,
            data,
            error,
        };
    }

    // 로그 출력
    private output(entry: LogEntry): void {
        if (entry.level < this.config.level) {
            return;
        }

        const prefix = `[${entry.timestamp}] [${entry.category}]`;

        if (this.config.enableConsole) {
            switch (entry.level) {
                case LogLevel.DEBUG:
                    console.log(`${prefix} [DEBUG] ${entry.message}`, entry.data || '');
                    break;
                case LogLevel.INFO:
                    console.info(`${prefix} [INFO] ${entry.message}`, entry.data || '');
                    break;
                case LogLevel.WARN:
                    console.warn(`${prefix} [WARN] ${entry.message}`, entry.data || '');
                    break;
                case LogLevel.ERROR:
                    console.error(`${prefix} [ERROR] ${entry.message}`, entry.data || '', entry.error || '');
                    break;
            }
        }

        // 파일 로깅 (필요시 구현)
        if (this.config.enableFile) {
            this.writeToFile(entry);
        }

        // 원격 로깅 (필요시 구현)
        if (this.config.enableRemote) {
            this.sendToRemote(entry);
        }
    }

    // 파일 로깅 (향후 구현)
    private writeToFile(entry: LogEntry): void {
        // TODO: 파일 로깅 구현
    }

    // 원격 로깅 (향후 구현)
    private sendToRemote(entry: LogEntry): void {
        // TODO: 원격 로깅 구현 (예: Sentry, LogRocket 등)
    }

    // 공개 메서드들
    public debug(category: LogCategory, message: string, data?: any): void {
        this.output(this.createLogEntry(LogLevel.DEBUG, category, message, data));
    }

    public info(category: LogCategory, message: string, data?: any): void {
        this.output(this.createLogEntry(LogLevel.INFO, category, message, data));
    }

    public warn(category: LogCategory, message: string, data?: any): void {
        this.output(this.createLogEntry(LogLevel.WARN, category, message, data));
    }

    public error(category: LogCategory, message: string, error?: Error, data?: any): void {
        this.output(this.createLogEntry(LogLevel.ERROR, category, message, data, error));
    }

    // 카테고리별 편의 메서드들
    public auth(message: string, data?: any): void {
        this.info(LogCategory.AUTH, message, data);
    }

    public api(message: string, data?: any): void {
        this.info(LogCategory.API, message, data);
    }

    public location(message: string, data?: any): void {
        this.info(LogCategory.LOCATION, message, data);
    }

    public recommendation(message: string, data?: any): void {
        this.info(LogCategory.RECOMMENDATION, message, data);
    }

    public userInteraction(message: string, data?: any): void {
        this.info(LogCategory.USER_INTERACTION, message, data);
    }

    public ui(message: string, data?: any): void {
        this.info(LogCategory.UI, message, data);
    }

    public system(message: string, data?: any): void {
        this.info(LogCategory.SYSTEM, message, data);
    }
}

// 싱글톤 인스턴스 export
export const logger = Logger.getInstance();

// 편의 함수들
export const logDebug = (category: LogCategory, message: string, data?: any) => 
    logger.debug(category, message, data);

export const logInfo = (category: LogCategory, message: string, data?: any) => 
    logger.info(category, message, data);

export const logWarn = (category: LogCategory, message: string, data?: any) => 
    logger.warn(category, message, data);

export const logError = (category: LogCategory, message: string, error?: Error, data?: any) => 
    logger.error(category, message, error, data);

// 카테고리별 편의 함수들
export const logAuth = (message: string, data?: any) => logger.auth(message, data);
export const logApi = (message: string, data?: any) => logger.api(message, data);
export const logLocation = (message: string, data?: any) => logger.location(message, data);
export const logRecommendation = (message: string, data?: any) => logger.recommendation(message, data);
export const logUserInteraction = (message: string, data?: any) => logger.userInteraction(message, data);
export const logUi = (message: string, data?: any) => logger.ui(message, data);
export const logSystem = (message: string, data?: any) => logger.system(message, data); 