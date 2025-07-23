document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const processFileBtn = document.getElementById('process-file');
    const extractionResults = document.getElementById('extraction-results');
    const useExtractedDataBtn = document.getElementById('use-extracted-data');
    const form = document.getElementById('solar-form');
    const reportDiv = document.getElementById('report');

    // Dados de irradiação solar por região (kWh/m²/dia)
    const irradiacaoSolar = {
        '49490000': 5.2, // Poço Verde, SE
        '49000': 5.1,    // Aracaju, SE (região)
        '40000': 5.3,    // Salvador, BA (região)
        '50000': 5.0,    // Recife, PE (região)
        '60000': 5.4,    // Fortaleza, CE (região)
        'default': 4.8   // Média nacional
    };

    // Dados extraídos da fatura
    let dadosExtraidos = null;

    // Upload da fatura
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('dragleave', handleDragLeave);

    fileInput.addEventListener('change', handleFileSelect);
    processFileBtn.addEventListener('click', processarFatura);
    useExtractedDataBtn.addEventListener('click', usarDadosExtraidos);

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            fileInput.files = files;
            handleFileSelect();
        }
    }

    function handleFileSelect() {
        const file = fileInput.files[0];
        if (file) {
            fileName.textContent = file.name;
            fileInfo.style.display = 'block';
            extractionResults.style.display = 'none';
        }
    }

    function processarFatura() {
        const file = fileInput.files[0];
        if (!file) return;

        // Simular processamento da fatura
        processFileBtn.innerHTML = '<span class="loading"></span> Processando...';
        processFileBtn.disabled = true;

        setTimeout(() => {
            // Simular extração de dados (baseado nas faturas analisadas)
            dadosExtraidos = {
                cep: '49490000',
                tipoLigacao: 'trifasico',
                tarifa: 0.925180,
                consumoAtual: 1652,
                consumoMeses: [1296, 2980, 1575, 1330, 1677, 1586, 1514, 1477, 1196, 1665, 1620, 1652]
            };

            // Exibir dados extraídos
            document.getElementById('extracted-cep').textContent = dadosExtraidos.cep;
            document.getElementById('extracted-tipo').textContent = 
                dadosExtraidos.tipoLigacao === 'trifasico' ? 'Trifásico' : 
                dadosExtraidos.tipoLigacao === 'bifasico' ? 'Bifásico' : 'Monofásico';
            document.getElementById('extracted-tarifa').textContent = 
                'R$ ' + dadosExtraidos.tarifa.toFixed(6);
            document.getElementById('extracted-consumo-atual').textContent = dadosExtraidos.consumoAtual;

            extractionResults.style.display = 'block';
            processFileBtn.innerHTML = 'Processar Fatura';
            processFileBtn.disabled = false;
        }, 2000);
    }

    function usarDadosExtraidos() {
        if (!dadosExtraidos) return;

        // Preencher formulário com dados extraídos
        document.getElementById('cep').value = dadosExtraidos.cep;
        document.getElementById('tarifa').value = dadosExtraidos.tarifa;
        
        // Selecionar tipo de ligação
        const radioTipo = document.querySelector(`input[name="tipoLigacao"][value="${dadosExtraidos.tipoLigacao}"]`);
        if (radioTipo) radioTipo.checked = true;

        // Preencher consumo mensal
        const inputsConsumo = document.querySelectorAll('.consumo-mes');
        dadosExtraidos.consumoMeses.forEach((consumo, index) => {
            if (inputsConsumo[index]) {
                inputsConsumo[index].value = consumo;
            }
        });

        // Rolar para o formulário
        document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
        
        // Destacar que os dados foram preenchidos
        const formCard = document.getElementById('form-card');
        formCard.style.border = '2px solid var(--success-color)';
        setTimeout(() => {
            formCard.style.border = '';
        }, 3000);
    }

    // Processar formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cep = document.getElementById('cep').value.replace(/\D/g, '');
        const tipoLigacao = document.querySelector('input[name="tipoLigacao"]:checked').value;
        const tarifa = parseFloat(document.getElementById('tarifa').value);
        const consumoInputs = document.querySelectorAll('.consumo-mes');
        const consumoMensal = Array.from(consumoInputs).map(input => parseInt(input.value));

        // Validar dados
        if (!cep || !tarifa || consumoMensal.some(c => isNaN(c) || c <= 0)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        // Calcular irradiação solar baseada no CEP
        const irradiacao = obterIrradiacaoSolar(cep);
        
        // Gerar relatório
        gerarRelatorio(cep, tipoLigacao, tarifa, consumoMensal, irradiacao);
    });

    function obterIrradiacaoSolar(cep) {
        // Buscar por CEP completo, depois por região
        const cepCompleto = cep;
        const cepRegiao = cep.substring(0, 5);
        const cepEstado = cep.substring(0, 2) + '000';

        return irradiacaoSolar[cepCompleto] || 
               irradiacaoSolar[cepRegiao] || 
               irradiacaoSolar[cepEstado] || 
               irradiacaoSolar.default;
    }

    function gerarRelatorio(cep, tipoLigacao, tarifa, consumoMensal, irradiacao) {
        // Cálculos
        const consumoTotal = consumoMensal.reduce((a, b) => a + b, 0);
        const consumoMedio = Math.round(consumoTotal / 12);
        const gastoAnual = consumoTotal * tarifa;
        const gastoMensal = gastoAnual / 12;

        // Taxa mínima por tipo de ligação
        const taxaMinima = {
            'monofasico': 30,
            'bifasico': 50,
            'trifasico': 100
        };

        // Cálculo do sistema solar necessário
        const consumoParaGeracao = Math.max(0, consumoMedio - taxaMinima[tipoLigacao]);
        const potenciaSistema = (consumoParaGeracao * 1000) / (irradiacao * 30 * 0.8); // 80% de eficiência
        const potenciaSistemaKW = Math.ceil(potenciaSistema / 1000);
        
        // Estimativa de economia (considerando que não pode zerar completamente a conta)
        const economiaAnual = consumoParaGeracao * 12 * tarifa;
        const economiaPercentual = (economiaAnual / gastoAnual) * 100;

        // Estimativa de investimento (R$ 4.500 por kW instalado - média 2025)
        const investimentoEstimado = potenciaSistemaKW * 4500;
        const payback = investimentoEstimado / economiaAnual;

        // Gerar HTML do relatório
        const reportHTML = `
            <h2>Relatório de Viabilidade - Energia Solar</h2>
            
            <div class="report-section">
                <h3>📍 Localização e Irradiação</h3>
                <p><strong>CEP:</strong> ${cep}</p>
                <p><strong>Irradiação Solar:</strong> ${irradiacao} kWh/m²/dia</p>
                <p><strong>Tipo de Ligação:</strong> ${tipoLigacao.charAt(0).toUpperCase() + tipoLigacao.slice(1)}</p>
            </div>

            <div class="report-section">
                <h3>⚡ Análise de Consumo</h3>
                <p><strong>Consumo Total Anual:</strong> ${consumoTotal.toLocaleString()} kWh</p>
                <p><strong>Consumo Médio Mensal:</strong> ${consumoMedio.toLocaleString()} kWh</p>
                <p><strong>Tarifa de Energia:</strong> R$ ${tarifa.toFixed(4)}/kWh</p>
                <p><strong>Gasto Anual Atual:</strong> <span class="highlight">R$ ${gastoAnual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></p>
                <p><strong>Gasto Mensal Médio:</strong> R$ ${gastoMensal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>

            <div class="report-section">
                <h3>☀️ Sistema Solar Recomendado</h3>
                <p><strong>Potência Recomendada:</strong> ${potenciaSistemaKW} kWp</p>
                <p><strong>Geração Mensal Estimada:</strong> ${Math.round(potenciaSistemaKW * irradiacao * 30 * 0.8)} kWh</p>
                <p><strong>Economia Anual:</strong> <span class="highlight">R$ ${economiaAnual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></p>
                <p><strong>Economia Percentual:</strong> ${economiaPercentual.toFixed(1)}%</p>
            </div>

            <div class="report-section">
                <h3>💰 Análise Financeira</h3>
                <p><strong>Investimento Estimado:</strong> R$ ${investimentoEstimado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                <p><strong>Payback:</strong> ${payback.toFixed(1)} anos</p>
                <p><strong>Economia em 25 anos:</strong> <span class="highlight">R$ ${(economiaAnual * 25 - investimentoEstimado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></p>
            </div>

            <div class="economy-message">
                🎉 Você pode economizar até R$ ${economiaAnual.toLocaleString('pt-BR', {minimumFractionDigits: 2})} por ano com energia solar!
            </div>

            <div class="report-section">
                <h3>📋 Próximos Passos</h3>
                <p>1. Solicite um orçamento detalhado com empresas especializadas</p>
                <p>2. Verifique a estrutura do seu telhado</p>
                <p>3. Analise as condições de financiamento disponíveis</p>
                <p>4. Considere a instalação de um sistema de ${potenciaSistemaKW}kWp</p>
            </div>
        `;

        reportDiv.innerHTML = reportHTML;
        reportDiv.style.display = 'block';
        reportDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('SW registrado'))
            .catch(error => console.log('SW falhou'));
    }
});

