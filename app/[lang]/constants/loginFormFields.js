const loginFields=[
    {
        labelText: "email",
        labelFor:"email",
        id:"email",
        name:"email",
        type:"email",
        autoComplete:"email",
        isRequired:true,
        placeholder: "email"
    },
    {
        labelText:"password",
        labelFor:"password",
        id:"password",
        name:"password",
        type:"password",
        autoComplete:"current-password",
        isRequired:true,
        placeholder:"password"
    }
]

const signupFields=[
    {
        labelText:"Username",
        labelFor:"username",
        id:"username",
        name:"username",
        type:"text",
        autoComplete:"username",
        isRequired:true,
        placeholder:"Username"
    },
    {
        labelText:"email",
        labelFor:"email",
        id:"email",
        name:"email",
        type:"email",
        autoComplete:"email",
        isRequired:true,
        placeholder:"email"
    },
    {
        labelText:"password",
        labelFor:"password",
        id:"password",
        name:"password",
        type:"password",
        autoComplete:"current-password",
        isRequired:true,
        placeholder:"password"
    },
    {
        labelText:"Confirm Password",
        labelFor:"confirm-password",
        id:"confirm-password",
        name:"confirm-password",
        type:"password",
        autoComplete:"confirm-password",
        isRequired:true,
        placeholder:"Confirm Password"
    }
]

export {loginFields,signupFields}