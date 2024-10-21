import {getDictionary} from "@/get-dictionary"
import {Locale} from "@/i18n-config"

export default async function Home({
                                       params: {lang},
                                   }: {
    params: { lang: Locale }
}) {
    const dictionary = await getDictionary(lang)

    return (
        <div>
            <h1 className="text-center font-bold text-gray-900 dark:text-indigo-200 text-5xl leading-tight mb-3">{dictionary["server-component"].welcome}</h1>
            <p className="text-lg font-medium text-gray-800 dark:text-cyan-300 text-center mb-5">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Totam corporis
                officia
                illum saepe voluptates, assumenda molestiae exercitationem quisquam illo omnis? Fuga, voluptates? Eum dolor ipsam expedita perspiciatis doloremque, ad illo!</p>
        </div>

    )
}