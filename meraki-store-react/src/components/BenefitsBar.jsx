export default function BenefitsBar() {
    const benefits = [
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />,
            title: 'Frete Grátis',
            text: 'Acima de R$ 299',
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
            title: 'Parcelamento',
            text: 'Em até 12x sem juros',
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />,
            title: 'Atendimento',
            text: 'Suporte via WhatsApp',
        },
    ]

    return (
        <section className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#E6CFC6]/30 flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {b.icon}
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-heading font-semibold text-gray-900 text-sm tracking-wide">{b.title}</h4>
                                <p className="text-gray-500 text-xs">{b.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
