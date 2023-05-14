import "./login.scss";
import {FunctionComponent, useCallback, useRef} from "react";

type LoginProps = {
	authorize: CallableFunction,
};

const Login: FunctionComponent<LoginProps> = ({authorize}) => {
	const instanceIdInput = useRef<HTMLInputElement>(null);
	const instanceApiTokenInput = useRef<HTMLInputElement>(null);

	const customSubmit = useCallback(() => {
		if (instanceIdInput.current?.value && instanceApiTokenInput.current?.value) {
			localStorage.setItem("gapi_instance_id", instanceIdInput.current.value);
			localStorage.setItem("gapi_instance_api_token", instanceApiTokenInput.current.value);

			authorize();
		}
	}, [authorize]);

	return <section className="login right-side">
		<form className="login-form" onSubmit={(event) => {
			event.preventDefault();
			customSubmit();
		}}>
			<input
				ref={instanceIdInput}
				className="login-form__input"
				name="instance_id"
				type="text"
				placeholder="Введите Instance ID..."
				autoFocus
			/>
			<input
				ref={instanceApiTokenInput}
				className="login-form__input"
				name="instance_api_token"
				type="text"
				placeholder="Введите Instance API Token..."
			/>
			<input
				className="login-form__submit"
				type="button"
				value="Войти"
				onClick={() => {
					customSubmit();
				}}
			/>
		</form>
	</section>;
};

export default Login;
