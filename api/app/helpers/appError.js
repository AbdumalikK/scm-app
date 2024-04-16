export default function AppError({ status, message, errors, name }){
	Error.call(this);
	Error.captureStackTrace(this);

	this.status = status;
	this.message = message;
	this.errors = errors;
	this.name = name;
};