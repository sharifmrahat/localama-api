import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const timeStamp = new Date().toISOString();

    //* Parse device info
    const userAgent = req.headers['user-agent'] || '';
    const ua = new UAParser(userAgent);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Something went wrong!';
    let errorMessages: { path: string; message: string }[] = [];

    //* NestJS HTTP Exceptions
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
        errorMessages = [{ path: '', message }];
      } else if (typeof response === 'object' && response !== null) {
        const resObj = response as Record<string, any>;
        message = (resObj.message as string) || message;

        if (Array.isArray(resObj.message)) {
          errorMessages = resObj.message.map((msg: string) => ({
            path: '',
            message: msg,
          }));
        } else {
          errorMessages = [{ path: '', message }];
        }
      }
    }

    //* General Errors
    else if (exception instanceof Error) {
      message = exception.message;
      errorMessages = [{ path: '', message }];
    }

    const stackArray: string[] =
      typeof (exception as Error)?.stack === 'string'
        ? ((exception as Error).stack ?? '')
            .split('\n')
            .map((line: string) => line.trim())
        : [];

    res.status(statusCode).json({
      statusCode,
      success: false,
      message: Array.isArray(message) ? message.at(0) : message,
      errorMessages,
      stack: stackArray,
      client: {
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        browser: `${browser.name || 'Unknown'} ${browser.version || ''}`.trim(),
        os: `${os.name || 'Unknown'} ${os.version || ''}`.trim(),
        device: device.type || 'desktop',
      },
      timeStamp,
    });
  }
}
