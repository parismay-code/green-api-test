export default (date: Date, withYear: boolean) => {
	let _date = date.getDate().toString();
	let month = (date.getMonth() + 1).toString();
	const year = date.getFullYear();

	if (_date.length === 1) {
		_date = `0${_date}`;
	}

	if (month.length === 1) {
		month = `0${month}`;
	}

	return `${_date}.${month}` + (withYear ? `.${year}` : '');
};
