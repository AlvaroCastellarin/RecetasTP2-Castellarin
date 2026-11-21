// Middleware generico: valida req.body contra un schema de Zod. Si falla responde 400 con el detalle por campo.
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function sendValidationError(res: Response, error: z.ZodError): void {
  // formErrors: errores que no son de un campo puntual (ej: un refine sobre el objeto entero).
  const { formErrors, fieldErrors } = z.flattenError(error);
  res.status(400).json({
    success: false,
    error: {
      message: formErrors[0] ?? "Los datos enviados no son validos",
      details: fieldErrors,
    },
  });
}

export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      sendValidationError(res, result.error);
      return;
    }

    // Reemplaza el body por la version parseada: con defaults aplicados y tipos ya coercionados.
    req.body = result.data;
    next();
  };
}
