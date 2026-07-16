import { HttpInterceptorFn } from '@angular/common/http';

/** Propaga X-Correlation-Id — o BFF gera se ausente e devolve no response. */
export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  const cid = crypto.randomUUID();
  return next(req.clone({ setHeaders: { 'X-Correlation-Id': cid } }));
};
