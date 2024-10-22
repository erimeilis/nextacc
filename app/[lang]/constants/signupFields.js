const signupFields = [
    {
        labelText: "phone",
        labelFor: "signupPhone",
        id: "signupPhone",
        name: "signupPhone",
        type: "phone",
        autoComplete: "phone",
        isRequired: true,
        placeholder: "phone",
        icon: "FaPhone",
    },
    {
        labelText: "email",
        labelFor: "signupEmail",
        id: "signupEmail",
        name: "signupEmail",
        type: "email",
        autoComplete: "email",
        isRequired: true,
        placeholder: "email",
        icon: "FaAt",
    },
    {
        labelText: "password",
        labelFor: "signupPassword",
        id: "signupPassword",
        name: "signupPassword",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "password",
        icon: "FaKey",
    },
    {
        labelText: "confirm",
        labelFor: "signupConfirmPassword",
        id: "signupConfirmPassword",
        name: "signupConfirmPassword",
        type: "password",
        autoComplete: "confirm-password",
        isRequired: true,
        placeholder: "confirm",
        icon: "FaCheckDouble",
    }
]

export {signupFields}