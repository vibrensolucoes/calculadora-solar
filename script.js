document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("solar-form");
    const reportCard = document.getElementById("report");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        reportCard.innerHTML = ""; // Clear previous report

        const cep = document.getElementById("cep").value;
        const tipoLigacao = document.querySelector("input[name=\"tipoLigacao\"]:checked").value;
        const tarifa = parseFloat(document.getElementById("tarifa").value);
        const consumos = Array.from(document.querySelectorAll(".consumo-mes")).map(input => parseFloat(input.value));

        if (consumos.some(isNaN) || isNaN(tarifa)) {
            reportCard.innerHTML = "<p class=\"error-message\">Por favor, preencha todos os campos de consumo e a tarifa corretamente.</p>";
            return;
        }

        const consumoAnual = consumos.reduce((sum, current) => sum + current, 0);
        const custoAnualSemSolar = (consumoAnual * tarifa).toFixed(2);

        // Simulação de custo com solar (simplificada para este exemplo)
        // Considerar taxa mínima (disponibilidade) e Fio B (45% para 2025)
        let custoDisponibilidadeAnual = 0;
        switch (tipoLigacao) {
            case "monofasico":
                custoDisponibilidadeAnual = 30 * tarifa * 12; // 30 kWh * tarifa * 12 meses
                break;
            case "bifasico":
                custoDisponibilidadeAnual = 50 * tarifa * 12; // 50 kWh * tarifa * 12 meses
                break;
            case "trifasico":
                custoDisponibilidadeAnual = 100 * tarifa * 12; // 100 kWh * tarifa * 12 meses
                break;
        }

        // Simplificação: Fio B sobre todo o consumo compensado para fins de simulação
        // Em um cenário real, o Fio B incide sobre a energia injetada que é compensada
        // e não sobre o autoconsumo instantâneo.
        const custoFioBAnual = (consumoAnual * tarifa * 0.45).toFixed(2); // 45% do consumo para 2025

        // CIP não é calculada aqui, pois varia por município
        const custoAnualComSolarEstimado = (parseFloat(custoDisponibilidadeAnual) + parseFloat(custoFioBAnual)).toFixed(2);

        const economiaAnualEstimada = (custoAnualSemSolar - custoAnualComSolarEstimado).toFixed(2);
        const percentualEconomia = ((economiaAnualEstimada / custoAnualSemSolar) * 100).toFixed(2);

        // Geração anual necessária para cobrir o consumo
        const geracaoAnualNecessaria = (consumoAnual * 1.15).toFixed(2); // 15% de margem de segurança

        // Exemplo de potência de painel e inversor (Intelbras)
        const potenciaPainel = 550; // Wp
        const potenciaInversor = 20000; // W (20 kW)

        const numPaineisEstimado = Math.ceil(geracaoAnualNecessaria / (potenciaPainel * 365 / 1000)); // kWh/ano para kWp
        const potenciaSistemaEstimada = (numPaineisEstimado * potenciaPainel / 1000).toFixed(2); // kWp

        reportCard.innerHTML = `
            <h2>Relatório de Economia Solar</h2>
            <div class="report-section">
                <h3>Consumo e Custos Atuais</h3>
                <p>Consumo Anual Total: <span class="highlight">${consumoAnual} kWh</span></p>
                <p>Custo Anual Estimado (sem solar): <span class="highlight">R$ ${custoAnualSemSolar}</span></p>
            </div>
            <div class="report-section">
                <h3>Simulação com Energia Solar (Sistema Protocolado em 2025)</h3>
                <p>Custo Anual Estimado (com solar): <span class="highlight">R$ ${custoAnualComSolarEstimado}</span></p>
                <p>Economia Anual Estimada: <span class="highlight">R$ ${economiaAnualEstimada}</span></p>
                <p>Percentual de Economia: <span class="highlight">${percentualEconomia}%</span></p>
            </div>
            <div class="report-section">
                <h3>Dimensionamento Estimado do Sistema Solar</h3>
                <p>Geração Anual Necessária: <span class="highlight">${geracaoAnualNecessaria} kWh</span></p>
                <p>Potência do Sistema Estimada: <span class="highlight">${potenciaSistemaEstimada} kWp</span></p>
                <p>Número de Painéis (${potenciaPainel}Wp): <span class="highlight">${numPaineisEstimado}</span></p>
                <p>Inversor Sugerido (Intelbras): <span class="highlight">${potenciaInversor / 1000} kW</span> (ou similar)</p>
            </div>
            <p class="economy-message">Parabéns! Com este sistema, você pode reduzir seus gastos com energia elétrica em aproximadamente ${percentualEconomia}% ao ano!</p>
            <p class="economy-message">Leve este relatório a um integrador credenciado da Intelbras para solicitar um orçamento detalhado e dar o próximo passo em direção à sua independência energética.</p>
        `;
    });

    // Service Worker for PWA
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("sw.js")
                .then(registration => {
                    console.log("Service Worker registered: ", registration);
                })
                .catch(error => {
                    console.error("Service Worker registration failed: ", error);
                });
        });
    }
});
