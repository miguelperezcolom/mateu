/**
 * WCAG 1.3.5 Identify Input Purpose on React Native: the wire's HTML autocomplete token
 * (FormFieldDto.autocomplete — `email`, `given-name`, `tel`…) becomes the platform's own hints:
 * `autoComplete` (Android autofill + react-native-web, which takes the HTML token) and
 * `textContentType` (iOS). Pure: only a type import from react-native, so it runs under node --test.
 */
import type { TextInputProps } from 'react-native';

type AutoComplete = NonNullable<TextInputProps['autoComplete']>;
type ContentType = NonNullable<TextInputProps['textContentType']>;

/** HTML token → React Native `autoComplete` value (its own names, which differ for a few). */
const AUTO_COMPLETE: Record<string, AutoComplete> = {
  name: 'name',
  'given-name': 'name-given',
  'additional-name': 'name-middle',
  'family-name': 'name-family',
  'honorific-prefix': 'name-prefix',
  'honorific-suffix': 'name-suffix',
  nickname: 'nickname',
  username: 'username',
  email: 'email',
  tel: 'tel',
  'tel-national': 'tel-national',
  'tel-country-code': 'tel-country-code',
  'street-address': 'street-address',
  'address-line1': 'address-line1',
  'address-line2': 'address-line2',
  'postal-code': 'postal-code',
  'country-name': 'country',
  country: 'country',
  'address-level1': 'address-line1',
  'address-level2': 'address-line2',
  'cc-name': 'cc-name',
  'cc-number': 'cc-number',
  'cc-exp': 'cc-exp',
  'cc-exp-month': 'cc-exp-month',
  'cc-exp-year': 'cc-exp-year',
  'cc-csc': 'cc-csc',
  bday: 'birthdate-full',
  'bday-day': 'birthdate-day',
  'bday-month': 'birthdate-month',
  'bday-year': 'birthdate-year',
  sex: 'gender',
  'new-password': 'new-password',
  'current-password': 'current-password',
  'one-time-code': 'sms-otp',
  organization: 'organization',
  'organization-title': 'organization-title',
  url: 'url',
  off: 'off',
};

/** HTML token → iOS `textContentType`. */
const CONTENT_TYPE: Record<string, ContentType> = {
  name: 'name',
  'given-name': 'givenName',
  'additional-name': 'middleName',
  'family-name': 'familyName',
  'honorific-prefix': 'namePrefix',
  'honorific-suffix': 'nameSuffix',
  nickname: 'nickname',
  username: 'username',
  email: 'emailAddress',
  tel: 'telephoneNumber',
  'street-address': 'fullStreetAddress',
  'address-line1': 'streetAddressLine1',
  'address-line2': 'streetAddressLine2',
  'address-level2': 'addressCity',
  'address-level1': 'addressState',
  'postal-code': 'postalCode',
  'country-name': 'countryName',
  'cc-number': 'creditCardNumber',
  'new-password': 'newPassword',
  'current-password': 'password',
  'one-time-code': 'oneTimeCode',
  organization: 'organizationName',
  'organization-title': 'jobTitle',
  url: 'URL',
  off: 'none',
};

export interface InputPurposeProps {
  autoComplete?: AutoComplete;
  textContentType?: ContentType;
}

/**
 * The TextInput props for a field's autocomplete token. A token may carry section/address-type
 * prefixes (`shipping postal-code`): the purpose is its LAST word. An unknown token gives nothing
 * (the platform keeps its default) rather than a wrong hint.
 */
export function inputPurposeProps(token: string | null | undefined): InputPurposeProps {
  if (!token || !token.trim()) return {};
  const words = token.trim().toLowerCase().split(/\s+/);
  const purpose = words[words.length - 1];
  const props: InputPurposeProps = {};
  if (AUTO_COMPLETE[purpose]) props.autoComplete = AUTO_COMPLETE[purpose];
  if (CONTENT_TYPE[purpose]) props.textContentType = CONTENT_TYPE[purpose];
  return props;
}
