import {ThreeDots} from 'react-loader-spinner'

export default function Loading({
                                    height
                                }) {
    return (
        <ThreeDots
            visible={true}
            height={height}
            width="48"
            color="#64748b"
            radius="4"
            ariaLabel="three-dots-loading"
            wrapperClass="flex w-full justify-center transition duration-300"
        />
    )
}