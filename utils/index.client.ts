export function getJoiMessagesByLocale(locale: Exclude<Layer.JoiLocales, 'custom'>, validator: Layer.InputValidators) {
  const locales = {
    ukUA: {
      base: {
        'any.required': 'Це поле є обовʼязковим для заповнення',
        'string.empty': 'Це поле є обовʼязковим для заповнення',
        'number.base': 'Це поле повинно містити лише цифри',
        'number.positive': 'Це поле повинно містити лише позитивні числа',
      },
      validators: {
        'string-cyrillic': { 'string.pattern.base': 'Це поле повинно містити лише кириличні літери, пробіли та апострофи' },
        'string-latin': { 'string.pattern.base': 'Це поле повинно містити лише латинські літери та пробіли' },
      }
    } as unknown as Layer.JoiMessages,
    enEn: {
      base: {
        'any.required': 'This field is required',
        'string.empty': 'This field is not allowed to be empty',
        'number.base': 'This field must contain only numbers',
        'number.positive': 'This field must contain only positive numbers',
      },
      validators: {
        'string-cyrillic': { 'string.pattern.base': 'This field should contain only Cyrillic letters, spaces, and apostrophes' },
        'string-latin': { 'string.pattern.base': 'This field should contain only Latin letters and spaces' },
      }
    } as unknown as Layer.JoiMessages
  }[locale]

  return { ...locales.base, ...locales.validators[validator] }
}
