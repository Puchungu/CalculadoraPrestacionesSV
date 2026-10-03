
/// Recibiendo los valores desde el formulario HTML en lugar de consola:
const SalarioMensualNum = parseFloat(document.getElementById('salario').value) || 0;
const fechaInicio = document.getElementById('fechaInicio').value;
const fechaFin = document.getElementById('fechaFin').value;
const causaDeFinalizacionNum = parseInt(document.getElementById('causa').value);
const horasExtrasDiurnasNum = parseInt(document.getElementById('horasDiurnas').value) || 0;
const horasExtrasNocturnasNum = parseInt(document.getElementById('horasNocturnas').value) || 0;
const diasAsuetoNum = parseInt(document.getElementById('diasAsueto').value) || 0;
const diasDescansoSemanalNum = parseInt(document.getElementById('diasDescansoSemanal').value) || 0;

const fechaInicioNum = new Date(fechaInicio.replace(/-/g, '/'));
const fechaFinNum = new Date(fechaFin.replace(/-/g, '/'));


//PASO 1: Calcular el salario básico diario (SBD) y el salario mínimo diario
//Calcular el salario basico diario (SBD) y el salario mínimo diario según el sector económico
const salarioBasicoDiario = SalarioMensualNum / 30;
//Calcular valor hora diuerna
const horaOrdinaria = salarioBasicoDiario / 8;

//PASO 2: JORNADAS EXTRAORDINARIAS

//Calcular el valor de las horas extras diurnas (Recardo del 100% del valor de la hora ordinaria)
const valorHoraExtraDiurna = (horaOrdinaria * 2)*horasExtrasDiurnasNum; 
//Calcular el valor de las horas extras nocturnas (Doble recargo 25% por ser de noche y 100% por ser hora extra)
const valorHoraExtraNocturna = (horaOrdinaria * 1.25*2)*horasExtrasNocturnasNum;
//Dias de asueto laborados (Recargo del 100% por ser día de asueto)
const valorDiasAsueto = (salarioBasicoDiario * 2)*diasAsuetoNum;
//Dias de descanso semanal laborados (Recargo del 50% por ser día de descanso)
const valorDiasDescansoSemanal = (salarioBasicoDiario * 1.5)*diasDescansoSemanalNum;


const inicio = dayjs(fechaInicioNum);
const fin = dayjs(fechaFinNum);

// ==========================================
// 1. CÁLCULO DE AGUINALDO (Corte 12 de diciembre)
// ==========================================
let corteAguinaldo = dayjs(`${fin.year()}-12-12`);
if (fin.isBefore(corteAguinaldo)) {
    corteAguinaldo = corteAguinaldo.subtract(1, 'year');
}
if (inicio.isAfter(corteAguinaldo)) {
    corteAguinaldo = inicio;
}

// Para aplicar el estándar comercial al aguinaldo:
const mesesAguinaldo = fin.diff(corteAguinaldo, 'month');
const fechaMesesAguinaldo = corteAguinaldo.add(mesesAguinaldo, 'month');
const diasSueltosAguinaldo = fin.diff(fechaMesesAguinaldo, 'day');

const diasProporcionalesAguinaldo = (mesesAguinaldo * 30) + diasSueltosAguinaldo;


// ==========================================
// 2. CÁLCULO DE VACACIÓN E INDEMNIZACIÓN (Aniversario)
// ==========================================

// Años exactos
const aniosLaborados = fin.diff(inicio, 'year');
const ultimoAniversario = inicio.add(aniosLaborados, 'year');

// Meses restantes (Para mostrar en pantalla y calcular cuota)
const mesesLaborados = fin.diff(ultimoAniversario, 'month');
const fechaUltimoMes = ultimoAniversario.add(mesesLaborados, 'month');

// Días sueltos desde el último mes completo
const diasSueltos = fin.diff(fechaUltimoMes, 'day');

// Días proporcionales comerciales (Para la matemática)
const diasProporcionales = (mesesLaborados * 30) + diasSueltos;


//PASO 3: Prestaciones proporcionales 

//Calcular la vacacion proporcional (15 dias de salario base mas un 30% de recargo)
const valorVacacionProporcional = ((salarioBasicoDiario * 15 * 1.3)*diasProporcionales)/365;
//Calcular aguinaldo proporcional (<3 anos = 15 dias, 3-10 anos = 19 dias, >10 anos = 21 dias)
let valorAguinaldoProporcional = 0;
if (diasProporcionalesAguinaldo < 200) {
    valorAguinaldoProporcional = 0;
}
if (aniosLaborados < 3) {
    valorAguinaldoProporcional = (salarioBasicoDiario * 15 / 365) * diasProporcionalesAguinaldo;
}
else if (aniosLaborados >= 3 && aniosLaborados <= 10) {
    valorAguinaldoProporcional = (salarioBasicoDiario * 19 / 365) * diasProporcionalesAguinaldo;
}
else if (aniosLaborados > 10) {
    valorAguinaldoProporcional = (salarioBasicoDiario * 21 / 365) * diasProporcionalesAguinaldo;
}

//PASO 4: Indemnización o compensación por cierre de contrato
const salarioMinimoMensual = 408.80; // Salario mínimo vigente (Comercio/Servicios)
const salarioMinimoDiario = salarioMinimoMensual / 30; 

let valorIndemnizacion = 0;

if (causaDeFinalizacionNum === 1) { 
    // === CASO 1: DESPIDO INJUSTIFICADO ===
    
    // La ley dice tope máximo de 4 salarios mínimos diarios para el despido
    const topeDespidoDiario = salarioMinimoDiario * 4;
    
    // Verificamos si el salario del trabajador sobrepasa el tope legal
    let salarioBaseIndemnizacion = salarioBasicoDiario;
    if (salarioBasicoDiario > topeDespidoDiario) {
        salarioBaseIndemnizacion = topeDespidoDiario;
    }

    // El despido paga 30 días de salario por cada año laborado
    const indemnizacionAnios = salarioBaseIndemnizacion * 30 * aniosLaborados;
    const indemnizacionProporcional = ((salarioBaseIndemnizacion * 30) / 360) * diasProporcionales;
    
    valorIndemnizacion = indemnizacionAnios + indemnizacionProporcional;

} else if (causaDeFinalizacionNum === 2) { 
    // === CASO 2: RENUNCIA VOLUNTARIA ===
    
    // La Ley Reguladora de la Prestación Económica por Renuncia Voluntaria 
    // exige tener al menos 2 años cumplidos laborando para tener derecho al pago.
    if (aniosLaborados >= 2) {
        
        // El tope legal para renuncia es más bajo: solo 2 salarios mínimos diarios
        const topeRenunciaDiario = salarioMinimoDiario * 2;
        
        let salarioBaseIndemnizacion = salarioBasicoDiario;
        if (salarioBasicoDiario > topeRenunciaDiario) {
            salarioBaseIndemnizacion = topeRenunciaDiario;
        }

        // La renuncia paga la mitad que el despido: 15 días por cada año laborado
        const indemnizacionAnios = salarioBaseIndemnizacion * 15 * aniosLaborados;
        const indemnizacionProporcional = ((salarioBaseIndemnizacion * 15) / 360) * diasProporcionales;
        
        valorIndemnizacion = indemnizacionAnios + indemnizacionProporcional;
        
    } else {
        // Si renuncia y tiene menos de 2 años, la ley dice que no le toca indemnización
        valorIndemnizacion = 0; 
    }
}


// PASO 6: CÁLCULO DE DESCUENTOS DE LEY (ISSS, AFP, RENTA)

// 1. Sumar solo los ingresos gravables (dejamos fuera la indemnización y el aguinaldo)
const montoGravable = valorHoraExtraDiurna + valorHoraExtraNocturna + 
                      valorDiasAsueto + valorDiasDescansoSemanal + 
                      valorVacacionProporcional;

// 2. Calcular ISSS (3% con el tope legal de $1,000)
let descuentoISSS = 0;
if (montoGravable > 1000) {
    descuentoISSS = 1000 * 0.03; // Tope máximo: $30.00
} else {
    descuentoISSS = montoGravable * 0.03;
}





















// 3. Calcular AFP (7.25%)
const descuentoAFP = montoGravable * 0.0725;

// 4. Calcular Impuesto sobre la Renta (ISR) según tabla mensual

// Evaluamos si el aguinaldo sobrepasa el límite exento de 2 salarios mínimos
const limiteAguinaldoExento = salarioMinimoMensual * 2;
let aguinaldoGravable = 0;

if (valorAguinaldoProporcional > limiteAguinaldoExento) {
    // Solo el sobrante paga renta
    aguinaldoGravable = valorAguinaldoProporcional - limiteAguinaldoExento;
}

// Sacamos la base imponible restando AFP e ISSS, y sumando el aguinaldo gravable (si lo hay)
const baseImponibleRenta = (montoGravable - descuentoISSS - descuentoAFP) + aguinaldoGravable;
let descuentoRenta = 0;

if (baseImponibleRenta > 472.00 && baseImponibleRenta <= 895.24) {
    descuentoRenta = ((baseImponibleRenta - 472.00) * 0.10) + 17.67;
} else if (baseImponibleRenta > 895.24 && baseImponibleRenta <= 2038.10) {
    descuentoRenta = ((baseImponibleRenta - 895.24) * 0.20) + 60.00;
} else if (baseImponibleRenta > 2038.10) {
    descuentoRenta = ((baseImponibleRenta - 2038.10) * 0.30) + 288.57;
}

const totalDescuentos = descuentoISSS + descuentoAFP + descuentoRenta;

// PASO 7: TOTALES Y CONSOLA DE RESULTADOS
const totalDevengadoBruto = montoGravable + valorAguinaldoProporcional + valorIndemnizacion;
const totalLiquido = totalDevengadoBruto - totalDescuentos;

console.log("\n===============================================");
console.log("      LIQUIDACIÓN LABORAL - EL SALVADOR      ");
console.log("===============================================");
console.log(`Tiempo laborado: ${aniosLaborados} años, ${mesesLaborados} meses.`);
console.log(`Días proporcionales para vacaciones: ${diasProporcionales} días.`);
console.log(`Días proporcionales para aguinaldo: ${diasProporcionalesAguinaldo} días.`);
console.log("-----------------------------------------------");
console.log(`[+] Horas Extras Diurnas:      $${valorHoraExtraDiurna.toFixed(2)}`);
console.log(`[+] Horas Extras Nocturnas:    $${valorHoraExtraNocturna.toFixed(2)}`);
console.log(`[+] Días de Asueto:            $${valorDiasAsueto.toFixed(2)}`);
console.log(`[+] Días de Descanso Semanal:  $${valorDiasDescansoSemanal.toFixed(2)}`);
console.log(`[+] Vacación Proporcional:     $${valorVacacionProporcional.toFixed(2)}`);
console.log(`[+] Aguinaldo Proporcional:    $${valorAguinaldoProporcional.toFixed(2)}`);
console.log(`[+] Compensación/Indemnización:$${valorIndemnizacion.toFixed(2)}`);
console.log("-----------------------------------------------");
console.log(`TOTAL DEVENGADO BRUTO:         $${totalDevengadoBruto.toFixed(2)}`);
console.log("-----------------------------------------------");
console.log(`[-] ISSS (3%):                 $${descuentoISSS.toFixed(2)}`);
console.log(`[-] AFP (7.25%):               $${descuentoAFP.toFixed(2)}`);
console.log(`[-] Renta (ISR):               $${descuentoRenta.toFixed(2)}`);
console.log(`TOTAL DESCUENTOS:              $${totalDescuentos.toFixed(2)}`);
console.log("===============================================");
console.log(`TOTAL LÍQUIDO A RECIBIR:       $${totalLiquido.toFixed(2)}`);
console.log("===============================================\n");