import {findPhoneNumbersInText} from 'libphonenumber-js';
import localization from '../Constants/localization';

export const PhoneNumberParser = (phoneNumber, countryCode) => {
  if (!phoneNumber) {
    return localization.numberValidation.phone_number_required;
  }

  try {
    const parsedNumber = findPhoneNumbersInText(phoneNumber, countryCode);

    if (parsedNumber) {
      if (!parsedNumber.isPossible()) {
        return localization.numberValidation.phone_number_not_possible;
      } else if (!parsedNumber.isValid()) {
        return localization.numberValidation.phone_number_invalid;
      }
    } else {
      return localization?.numberValidation?.unable_to_parse_phone_number;
    }
  } catch (error) {
    console.error(
      localization.numberValidation.error_parsing_phone_number,
      error,
    );
    return localization.numberValidation.phone_number_parsing_error;
  }
};
