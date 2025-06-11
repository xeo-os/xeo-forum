export default function Page(
    props: {
        params: { locale: string; id: string; slug: string },
    }
) {
    const { params } = props;
    const { locale, id, slug } = params;

    return (
        <div>
            <h1>Post Page</h1>
            <p>Locale: {locale}</p>
            <p>ID: {id}</p>
            <p>Slug: {slug}</p>
        </div>
    );
}