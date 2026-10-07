// --- CONTROL DE CAMPOS CONDICIONALES ---
document.getElementById('causa').addEventListener('change', function() {
  const campoPreaviso = document.getElementById('campoPreaviso');
  campoPreaviso.style.display = this.value === '2' ? 'block' : 'none';
});

// --- FUNCIÓN PRINCIPAL DE CÁLCULO ---
function procesarLiquidacion() {
  //////////////////////////// INPUTS USUARIO ///////////////////////////////////////////////////////////////
  const nombreEmpleado = document.getElementById('nombreEmpleado')?.value.trim() || '';
  const duiEmpleado = document.getElementById('duiEmpleado')?.value.trim() || '';
  const SalarioMensualNum = parseFloat(document.getElementById('salarioMensual').value) || 0;
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  const ultimaVacacion = document.getElementById('fechaUltimaVacacion').value;
  const causaDeFinalizacionNum = parseInt(document.getElementById('causa').value);
  const horasExtrasDiurnasNum = parseInt(document.getElementById('horasExtrasDiurnas').value) || 0;
  const horasExtrasNocturnasNum = parseInt(document.getElementById('horasExtrasNocturnas').value) || 0;
  const diasAsuetoNum = parseInt(document.getElementById('diasAsueto').value) || 0;
  const diasDescansoSemanalNum = parseInt(document.getElementById('diasDescanso').value) || 0;

  //////////////////////////// CÁLCULO BASE SALARIAL ///////////////////////////////////////////////////////
  const salarioBasicoDiario = SalarioMensualNum / 30;
  const H = salarioBasicoDiario / 8;

  // Horas extras (Art. 168 y 169)
  const hE = (H * 2) * horasExtrasDiurnasNum; 
  const hN = (H * 1.25 * 2) * horasExtrasNocturnasNum;

  // Días de asueto y descanso laborados (Art. 175 y 192)
  const sE = (salarioBasicoDiario * 2) * diasAsuetoNum;
  const sDD = (salarioBasicoDiario * 1.5) * diasDescansoSemanalNum;

  //////////////////////////// CÁLCULO DE FECHAS ///////////////////////////////////////////////////////////
  const inicio = dayjs(fechaInicio);
  const fin = dayjs(fechaFin);
  const ultimaVacacionDate = dayjs(ultimaVacacion);

  const diasProporcionalesVacacion = fin.diff(ultimaVacacionDate, 'day');
  const aniosLaborados = fin.diff(inicio, 'year');

  let diaPagoAguinaldo = dayjs(`${fin.year()}-12-12`);
  if (fin.isBefore(diaPagoAguinaldo)) {
    diaPagoAguinaldo = diaPagoAguinaldo.subtract(1, 'year');
  } 
  if (inicio.isAfter(diaPagoAguinaldo)) {
    diaPagoAguinaldo = inicio;
  }
  const diasProporcionalesAguinaldo = fin.diff(diaPagoAguinaldo, 'day');

  const fechaUltimoAnio = inicio.add(aniosLaborados, 'year');
  const diasDespuesUltimoAnio = fin.diff(fechaUltimoAnio, 'day');

  //////////////////////////// VACACIONES //////////////////////////////////////////////////////////////////
  let totalRecargoVacacional = 1.3;
  if (document.getElementById('checkAlojamiento').checked) totalRecargoVacacional += 0.25;
  if (document.getElementById('checkAlimentacion').checked) totalRecargoVacacional += 0.25;

  const tV = (salarioBasicoDiario * 15 * totalRecargoVacacional);
  const vP = (tV * diasProporcionalesVacacion) / 365;

  const vacacionPagada = document.querySelector("input[name='vacacionPagada']:checked").value;
  let montoFinalVacacion = vacacionPagada === "si" ? vP : (tV + vP);

  //////////////////////////// AGUINALDO (Art. 198 C.T.) //////////////////////////////////////////////////
  let pA = 0;
  if (aniosLaborados < 3) {
     pA = salarioBasicoDiario * 15;
  } else if (aniosLaborados >= 3 && aniosLaborados < 10) {
     pA = salarioBasicoDiario * 19;
  } else {
     pA = salarioBasicoDiario * 21;
  }
  const aP = (pA / 365) * diasProporcionalesAguinaldo;

  //////////////////////////// INDEMNIZACIÓN / PRESTACIÓN //////////////////////////////////////////////////
  let indemnizacionTotal = 0;
  if (causaDeFinalizacionNum === 1) { // Despido Injustificado (Art. 58 C.T.)
    const tope4SalariosMensual = 408.80 * 4;
    const salarioBaseMensual = Math.min(SalarioMensualNum, tope4SalariosMensual);

    const indemnizacionPorAnosLaborados = salarioBaseMensual * aniosLaborados; 
    const indemnizacionDiaria = salarioBaseMensual / 365;
    const indemnizacionFraccion = indemnizacionDiaria * diasDespuesUltimoAnio;
    indemnizacionTotal = indemnizacionPorAnosLaborados + indemnizacionFraccion;

  } else if (causaDeFinalizacionNum === 2) { // Renuncia Voluntaria (Ley 2014)
    const preaviso = document.querySelector("input[name='preaviso']:checked")?.value || 'si';
    if (aniosLaborados >= 2 && preaviso === "si") {
      const tope2SalariosMensual = 408.80 * 2;
      const salarioBaseMensual = Math.min(SalarioMensualNum, tope2SalariosMensual);

      const salario15Dias = (salarioBaseMensual / 30) * 15; 
      const prestacionPorAniosLaborados = salario15Dias * aniosLaborados;
      const prestacionDiaria = salario15Dias / 365;
      const prestacionFraccion = prestacionDiaria * diasDespuesUltimoAnio;
      indemnizacionTotal = prestacionPorAniosLaborados + prestacionFraccion;
    } else {
      indemnizacionTotal = 0;
    }
  }

  // Subtotal ingresos
  const totalExtrasYAsuetos = hE + hN + sE + sDD;
  const totalBruto = indemnizacionTotal + aP + montoFinalVacacion + totalExtrasYAsuetos;

  //////////////////////////// DEDUCCIONES DE LEY /////////////////////////////////////////////////////////
  const totalGravable = montoFinalVacacion + totalExtrasYAsuetos;
  const aguinaldoGravableRenta = Math.max(0, aP - 1500);

  let retencionISSS = 0;
  let retencionAFP = 0;
  let retencionRenta = 0;

  if (totalGravable > 0 || aguinaldoGravableRenta > 0) {
    // ISSS (3% sobre gravable ordinario, tope de $1,000)
    const baseISSS = Math.min(totalGravable, 1000);
    retencionISSS = baseISSS * 0.03;

    // AFP (7.25% sobre gravable ordinario)
    retencionAFP = totalGravable * 0.0725;

    // Renta Imponible
    const rentaImponible = (totalGravable - (retencionISSS + retencionAFP)) + aguinaldoGravableRenta;

    // Tramos mensuales de renta
    if (rentaImponible > 2038.10) {
      retencionRenta = ((rentaImponible - 2038.11) * 0.30) + 288.57;
    } else if (rentaImponible >= 895.25) {
      retencionRenta = ((rentaImponible - 895.25) * 0.20) + 60.00;
    } else if (rentaImponible >= 550.01) {
      retencionRenta = ((rentaImponible - 550.00) * 0.10) + 17.67;
    } else {
      retencionRenta = 0;
    }
  }

  const totalDeducciones = retencionISSS + retencionAFP + retencionRenta;
  const totalNetoPagar = totalBruto - totalDeducciones;

  //////////////////////////// MOSTRAR RESULTADOS /////////////////////////////////////////////////////////
  document.getElementById('lblAntiguedad').textContent = `${aniosLaborados} años, ${diasDespuesUltimoAnio} días`;
  document.getElementById('lblSalarioDiario').textContent = `$${salarioBasicoDiario.toFixed(2)}`;

  const lblTrabajador = document.getElementById('lblNombreTrabajador');
  if (lblTrabajador) lblTrabajador.textContent = nombreEmpleado || 'Anonimo';

  const lblDUI = document.getElementById('lblDUI');
  if (lblDUI) lblDUI.textContent = duiEmpleado || '--';

  document.getElementById('lblDiasVacacion').textContent = `${diasProporcionalesVacacion} días`;
  document.getElementById('lblDiasAguinaldo').textContent = `${diasProporcionalesAguinaldo} días`;

  document.getElementById('lblIndemnizacion').textContent = `$${indemnizacionTotal.toFixed(2)}`;
  document.getElementById('lblAguinaldo').textContent = `$${aP.toFixed(2)}`;
  document.getElementById('lblVacaciones').textContent = `$${montoFinalVacacion.toFixed(2)}`;

  document.getElementById('lblHorasDiurnas').textContent = `$${hE.toFixed(2)}`;
  document.getElementById('lblHorasNocturnas').textContent = `$${hN.toFixed(2)}`;
  document.getElementById('lblDiasAsueto').textContent = `$${sE.toFixed(2)}`;
  document.getElementById('lblDescansoSemanal').textContent = `$${sDD.toFixed(2)}`;
  document.getElementById('lblTotalBruto').textContent = `$${totalBruto.toFixed(2)}`;

  document.getElementById('lblISSS').textContent = `-$${retencionISSS.toFixed(2)}`;
  document.getElementById('lblAFP').textContent = `-$${retencionAFP.toFixed(2)}`;
  document.getElementById('lblRenta').textContent = `-$${retencionRenta.toFixed(2)}`;
  document.getElementById('lblTotalNeto').textContent = `$${totalNetoPagar.toFixed(2)}`;

  // Mostrar botones de acción post-cálculo
  const btnPDF = document.getElementById('btnExportarPDF');
  const btnNuevo = document.getElementById('btnNuevoFiniquito');
  if (btnPDF) btnPDF.style.display = 'block';
  if (btnNuevo) btnNuevo.style.display = 'block';
}

// --- SUBMIT DEL FORMULARIO ---
document.getElementById('formularioLiquidacion').addEventListener('submit', function(event) {
  event.preventDefault();
  procesarLiquidacion();
});

// Ocultar botones si el usuario edita inputs
document.getElementById('formularioLiquidacion').addEventListener('input', function() {
  const btnPDF = document.getElementById('btnExportarPDF');
  const btnNuevo = document.getElementById('btnNuevoFiniquito');
  if (btnPDF) btnPDF.style.display = 'none';
  if (btnNuevo) btnNuevo.style.display = 'none';
});

// --- SINCRONIZACIÓN DE ASUETOS CON CHECKBOXES ---
const inputAsueto = document.getElementById('diasAsueto');
const checkboxesAsueto = document.querySelectorAll('.chk-asueto');

checkboxesAsueto.forEach(chk => {
  chk.addEventListener('change', () => {
    const totalMarcados = document.querySelectorAll('.chk-asueto:checked').length;
    if (inputAsueto) inputAsueto.value = totalMarcados;
  });
});

if (inputAsueto) {
  inputAsueto.addEventListener('input', () => {
    checkboxesAsueto.forEach(chk => chk.checked = false);
  });
}

// --- FUNCIÓN PARA REINICIAR LA CALCULADORA ---
document.getElementById('btnNuevoFiniquito').addEventListener('click', function() {
  const form = document.getElementById('formularioLiquidacion');
  if (form) form.reset();

  document.getElementById('horasExtrasDiurnas').value = '0';
  document.getElementById('horasExtrasNocturnas').value = '0';
  document.getElementById('diasAsueto').value = '0';
  document.getElementById('diasDescanso').value = '0';

  // Desmarcar chips de asueto
  checkboxesAsueto.forEach(chk => chk.checked = false);

  const campoPreaviso = document.getElementById('campoPreaviso');
  if (campoPreaviso) campoPreaviso.style.display = 'none';

  const contenedorError = document.getElementById('mensajeError');
  if (contenedorError) {
    contenedorError.style.display = 'none';
    contenedorError.textContent = '';
  }

  const setTexto = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };

  setTexto('lblNombreTrabajador', 'Anonimo');
  setTexto('lblDUI', '--');
  setTexto('lblAntiguedad', '--');
  setTexto('lblSalarioDiario', '$0.00');
  setTexto('lblDiasVacacion', '0 días');
  setTexto('lblDiasAguinaldo', '0 días');

  setTexto('lblIndemnizacion', '$0.00');
  setTexto('lblAguinaldo', '$0.00');
  setTexto('lblVacaciones', '$0.00');
  setTexto('lblHorasDiurnas', '$0.00');
  setTexto('lblHorasNocturnas', '$0.00');
  setTexto('lblDiasAsueto', '$0.00');
  setTexto('lblDescansoSemanal', '$0.00');
  setTexto('lblTotalBruto', '$0.00');

  setTexto('lblISSS', '-$0.00');
  setTexto('lblAFP', '-$0.00');
  setTexto('lblRenta', '-$0.00');
  setTexto('lblTotalNeto', '$0.00');

  this.style.display = 'none';
  const btnPDF = document.getElementById('btnExportarPDF');
  if (btnPDF) btnPDF.style.display = 'none';

  document.getElementById('nombreEmpleado')?.focus();
});