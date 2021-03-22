import { Random } from 'meteor/random';

UTILS.forms = {
	//Guarantees unique Ids for all fields, especially when same form is in DOM multiple times
	getFormDefinition(formName) {
		const formWithoutIds = JSON.parse(JSON.stringify(UTILS.forms[formName]));

		return formWithoutIds.map((formField) => {
			formField.id = Random.id(17);

			return formField;
		});
	},

	studentUser: [
		{
			fieldType: 'text',
			name: 'studentFirstNameInput',
			className: 'firstNameInput',
			label: 'First Name',
			type: 'text',
			required: true,
			autocomplete: 'off'
		},
		{
			fieldType: 'text',
			name: 'studentLastNameInput',
			className: 'lastNameInput',
			label: 'Last Name',
			type: 'text',
			required: true,
			autocomplete: 'off'
		},
		{
			fieldType: 'text',
			name: 'studentEmailInput',
			className: 'emailInput',
			label: 'Email',
			type: 'email',
			required: true,
			autocomplete: 'off'
		},
		{
			fieldType: 'phone',
			name: 'studentPhoneInput',
			className: 'phoneInput',
			label: 'Phone',
			required: false,
			autocomplete: 'off'
		},
		{
			fieldType: 'text',
			name: 'studentCityInput',
			className: 'cityInput',
			label: 'City',
			type: 'text',
			required: false,
			autocomplete: 'off'
		},
		{
			fieldType: 'select',
			options: UTILS.users.getStateSelectOptions(),
			name: 'studentStateSelect',
			className: 'stateSelect',
			label: 'State',
			required: false,
			autocomplete: 'off'
		},
	],

};
