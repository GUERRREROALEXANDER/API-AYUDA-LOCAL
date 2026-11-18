import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

// Traduce errores de Postgres a respuestas HTTP claras en vez de un 500 generico.
const PG_ERRORS: Record<string, { status: number; message: string }> = {
  '23503': { status: HttpStatus.CONFLICT, message: 'El registro tiene datos relacionados o referencia uno que no existe' },
  '23505': { status: HttpStatus.CONFLICT, message: 'Ya existe un registro con ese valor unico' },
  '22P02': { status: HttpStatus.BAD_REQUEST, message: 'Identificador invalido' },
};

@Catch(QueryFailedError)
export class DbExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError & { code?: string }, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<{ status(code: number): { json(body: unknown): unknown } }>();
    const mapped = PG_ERRORS[exception.code ?? ''];
    if (!mapped) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ statusCode: 500, message: 'Internal server error' });
    }
    return res.status(mapped.status).json({ statusCode: mapped.status, message: mapped.message, error: HttpStatus[mapped.status] });
  }
}
