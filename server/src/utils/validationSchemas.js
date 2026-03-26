const Joi = require('joi');

const urlSchema = Joi.object({
    longUrl: Joi.string().uri().required().messages({
        'string.uri': 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.',
        'any.required': 'longUrl is a required field.'
    }),
    customAlias: Joi.string().alphanum().min(3).max(15).optional().messages({
        'string.alphanum': 'Custom alias must only contain alphanumeric characters.',
        'string.min': 'Custom alias minimum length is 3.',
        'string.max': 'Custom alias maximum length is 15.'
    }),
    expiresInDays: Joi.number().integer().min(1).max(365).optional().messages({
        'number.base': 'Expiration must be a number representing days.'
    })
});

module.exports = {
    urlSchema
};
