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
        labelText:"phone",
        labelFor:"phone",
        id:"phone",
        name:"phone",
        type:"phone",
        autoComplete:"phone",
        isRequired:true,
        placeholder:"phone"
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
        labelText:"confirm",
        labelFor:"confirm-password",
        id:"confirm-password",
        name:"confirm-password",
        type:"password",
        autoComplete:"confirm-password",
        isRequired:true,
        placeholder:"confirm"
    }
]

export {loginFields,signupFields}