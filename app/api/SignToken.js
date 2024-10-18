import jwt from 'jsonwebtoken';

const SignToken = async (email)=> {
    return await jwt.sign({id: email}, process.env.NEXT_PUBLIC_JWT_SECRET_KEY, {expiresIn: '1d'})
}

export default SignToken;