const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  // SE ERRORS FOR VAZIO, CONTINUAR RODANDO
  if (errors.isEmpty()) {
    return next();
  }

  // SE NÃO, VAI PUXAR O ERRO E JOGAR NO ARRAY ABAIXO
  const extractedErrors = [];

  errors.array().map((err) => extractedErrors.push(err.msg));

  // RETORNAR O ARRAY DE ERROS PARA O FRONT-END
  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = validate;
