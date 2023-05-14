export default (name: string): string => {
	const value = name.replace("+", "");

	const numericValue = parseInt(value);

	if (isNaN(numericValue) || numericValue.toString().length !== value.length) {
		return name;
	}

	return `+${value.slice(-15, -10)} (${value.slice(-10, -7)}) ${value.slice(-7, -4)}-${value.slice(-4, -2)}-${value.slice(-2)}`;
};
