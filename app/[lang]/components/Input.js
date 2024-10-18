const fixedInputClass="rounded-md appearance-none relative block w-full px-3 py-2 " +
    "border border-gray-300 dark:border-indigo-600 " +
    "focus:outline-none focus:ring-amber-500 dark:focus:ring-purple-500 focus:border-amber-700 dark:focus:border-purple-500 focus:z-10 sm:text-sm " +
    "bg-white dark:bg-indigo-950 "

export default function Input({
                                  handleChange,
                                  value,
                                  labelText,
                                  labelFor,
                                  id,
                                  name,
                                  type,
                                  isRequired=false,
                                  placeholder,
                                  customClass
                              }){
    return(
        <div className="my-5">
            <label htmlFor={labelFor} className="sr-only">
                {labelText}
            </label>
            <input
                onChange={handleChange}
                value={value}
                id={id}
                name={name}
                type={type}
                required={isRequired}
                className={fixedInputClass+customClass}
                placeholder={placeholder}
            />
        </div>
    )
}