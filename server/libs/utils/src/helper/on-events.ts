import { applyDecorators } from '@nestjs/common';
import { OnEvent as OnEventBase, OnEventType } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

import { ErrorHandler } from './error-handler.decorator';

export const OnEvent = (
  events: OnEventType | OnEventType[],
  options?: OnEventOptions | undefined,
) =>
  events instanceof Array
    ? applyDecorators(
        ErrorHandler(),
        ...events.map((e) => OnEventBase(e, options)),
      )
    : applyDecorators(ErrorHandler(), OnEventBase(events, options));
