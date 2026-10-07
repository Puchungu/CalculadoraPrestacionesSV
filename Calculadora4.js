document.getElementById('causa').addEventListener('change', function() {
      const campoPreaviso = document.getElementById('campoPreaviso');
      campoPreaviso.style.display = this.value === '2' ? 'block' : 'none';
    });


function procesarLiquidacion() {
  ////////////////////////////INPUTS USUARIO/////////////////////////////////////////////////////////////////
  const nombreEmpleado = document.getElementById('nombreEmpleado')?.value.trim() || '';
  const duiEmpleado = document.getElementById('duiEmpleado')?.value.trim() || '';
  const contenedorError = document.getElementById('mensajeError');
  const SalarioMensualNum = parseFloat(document.getElementById('salarioMensual').value) || 0;
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  const ultimaVacacion = document.getElementById('fechaUltimaVacacion').value;
  const causaDeFinalizacionNum = parseInt(document.getElementById('causa').value);
  const horasExtrasDiurnasNum = parseInt(document.getElementById('horasExtrasDiurnas').value) || 0;
  const horasExtrasNocturnasNum = parseInt(document.getElementById('horasExtrasNocturnas').value) || 0;
  const diasAsuetoNum = parseInt(document.getElementById('diasAsueto').value) || 0;
  const diasDescansoSemanalNum = parseInt(document.getElementById('diasDescanso').value) || 0;
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  //Calcular Salario Basico Diario
  const salarioBasicoDiario = SalarioMensualNum / 30;

  //Calcular Hora Ordinaria (Sueldo por hora)
  const H = salarioBasicoDiario / 8;

  //Calcular Hora Extra Diurna (Calculamos la hora extra diurna y se multiplica por el numero de horas extra que trabajo)
  const hE = (H * 2) * horasExtrasDiurnasNum; 

  //Calcular Hora Extra Nocturna (Calculamos la hora extra nocturna (extra se multiplica por 2) y se multiplica por el numero de horas nocturna (1.25) que trabajo)
  const hN = (H * 1.25 * 2) * horasExtrasNocturnasNum;

  ////////////CALCULANDO LAS FECHAS ////////////////
  const inicio = dayjs(fechaInicio);
  const fin = dayjs(fechaFin);
  const ultimaVacacionDate = dayjs(ultimaVacacion);
  const diasProporcionalesVacacion = fin.diff(ultimaVacacionDate, 'day');
  const aniosLaborados = fin.diff(inicio, 'year'); //años laborados desde la fecha de inicio hasta la fecha de finalizacion del contrato
  let diaPagoAguinaldo = dayjs(`${fin.year()}-12-12`); //fecha de pago de aguinaldo segun ley laboral de El Salvador, 12 de diciembre de cada año
  if (fin.isBefore(diaPagoAguinaldo)) {
    diaPagoAguinaldo = diaPagoAguinaldo.subtract(1, 'year');
  } 
  if (inicio.isAfter(diaPagoAguinaldo)) {
    diaPagoAguinaldo = inicio;
  }
  const diasProporcionalesAguinaldo = fin.diff(diaPagoAguinaldo, 'day'); //dias de aguinaldo desde la fecha de pago del aguinaldo hasta la fecha de finalizacion del contrato

  //encontrando el ultimo dia exacto en que cumplio su ultimo ano de trabajo
  const fechaUltimoAnio = inicio.add(aniosLaborados, 'year');
  //encontrando los dias que pasaron despues de su ultimo ano completo
  const diasDespuesUltimoAnio = fin.diff(fechaUltimoAnio, 'day');



  //Calculando dias de asueto laborado 
  const sE = (salarioBasicoDiario * 2) * diasAsuetoNum;

  //Calculando dias de descanso semanal laborado
  const sDD = (salarioBasicoDiario * 1.5) * diasDescansoSemanalNum;

  //Creamos una variable para el recargo total y validamos si el usuario selecciono alojamiento y/o alimentacion para sumarlo al recargo total
  let totalRecargoVacacional = 1.3;
  if (document.getElementById('checkAlojamiento').checked) totalRecargoVacacional += 0.25;
  if (document.getElementById('checkAlimentacion').checked) totalRecargoVacacional += 0.25;

  //Calculando total de vacaciones
  const tV = (salarioBasicoDiario * 15 * totalRecargoVacacional);

  //Calculando vacacion proporcional
  const vP = (tV * diasProporcionalesVacacion) / 365;

  //Calculando total de vacaciones, si fueron pagadas o no
  const vacacionPagada = document.querySelector("input[name='vacacionPagada']:checked").value;
  let montoFinalVacacion = 0;
  if (vacacionPagada === "si") {
      montoFinalVacacion = vP;
  } else {
      montoFinalVacacion = tV + vP;
  }

  //Calculando el total de aguinaldo
  let pA = 0;
  if (aniosLaborados < 3) {
     pA = salarioBasicoDiario * 15;
  } else if (aniosLaborados >= 3 && aniosLaborados <= 10) {
     pA = salarioBasicoDiario * 19;
  } else if (aniosLaborados > 10) {
     pA = salarioBasicoDiario * 21;
  }

  //Calculando aguinaldo proporcional
  const aP = (pA / 365) * diasProporcionalesAguinaldo;

//Calculando la indemnizacion por despido injustificado
    let indemnizacionTotal = 0;
    if (causaDeFinalizacionNum === 1) { // Despido Injustificado
        let salarioBaseMensual = SalarioMensualNum;
        const tope4SalariosMensual = 408.80 * 4;
        if (SalarioMensualNum > tope4SalariosMensual) {
            salarioBaseMensual = tope4SalariosMensual;
        }

        const indemnizacionPorAnosLaborados = salarioBaseMensual * aniosLaborados; 
        const indemnizacionDiaria = salarioBaseMensual / 365;
        const indemnizacionFraccion = indemnizacionDiaria * diasDespuesUltimoAnio;
        indemnizacionTotal = indemnizacionPorAnosLaborados + indemnizacionFraccion;

    } else if (causaDeFinalizacionNum === 2) { // Renuncia
        const preaviso = document.querySelector("input[name='preaviso']:checked")?.value || 'si';
        if (aniosLaborados >= 2 && preaviso ==="si") {
            let salarioBaseMensual = SalarioMensualNum;
            const tope2SalariosMensual = 408.80 * 2;
            if (SalarioMensualNum > tope2SalariosMensual) {
                salarioBaseMensual = tope2SalariosMensual;
            }

            const salario15Dias = (salarioBaseMensual / 30) * 15; 
            const prestacionPorAniosLaborados = salario15Dias * aniosLaborados;
            const prestacionDiaria = salario15Dias / 365;
            const prestacionFraccion = prestacionDiaria * diasDespuesUltimoAnio;
            indemnizacionTotal = prestacionPorAniosLaborados + prestacionFraccion;
        }else {
            indemnizacionTotal = 0;
        }
    }


    //Calculando el total bruto a pagar
    const totalExtrasYAsuetos = hE + hN + sE + sDD;
    const totalBruto = indemnizacionTotal + aP + montoFinalVacacion + totalExtrasYAsuetos;


   // 1. BASE GRAVABLE (Solo rubros sujetos a retención: vacaciones y extras/asuetos)
  const totalGravable = montoFinalVacacion + totalExtrasYAsuetos;
  const aguinaldoGravableRenta = Math.max(0, aP - 1500);

  let retencionISSS = 0;
  let retencionAFP = 0;
  let retencionRenta = 0;

  if (totalGravable > 0 || aguinaldoGravableRenta > 0) {
    // 2. ISSS (3% con tope legal de $1,000.00)
    const baseISSS = Math.min(totalGravable, 1000);
    retencionISSS = baseISSS * 0.03;

    // 3. AFP (7.25%)
    retencionAFP = totalGravable * 0.0725;

    // 4. RENTA IMPONIBLE
    const rentaImponible = totalGravable - (retencionISSS + retencionAFP)+ aguinaldoGravableRenta;

    // 5. EVALUACIÓN DE TRAMOS DE RENTA
    if (rentaImponible > 2038.10) {
      // Tramo IV: Desde $2,038.11 en adelante
      retencionRenta = ((rentaImponible - 2038.11) * 0.30) + 288.57;
    } else if (rentaImponible >= 895.25) {
      // Tramo III: $895.25 a $2,038.10
      retencionRenta = ((rentaImponible - 895.25) * 0.20) + 60.00;
    } else if (rentaImponible >= 550.01) {
      // Tramo II: $550.01 a $895.24
      retencionRenta = ((rentaImponible - 550.00) * 0.10) + 17.67;
    } else {
      // Tramo I: Hasta $550.00
      retencionRenta = 0;
    }
  }

  // 6. TOTALES FINALES
  const totalDeducciones = retencionISSS + retencionAFP + retencionRenta;
  const totalNetoPagar = totalBruto - totalDeducciones;

  // 7. ACTUALIZAR EN PANTALLA
  document.getElementById('lblISSS').textContent = `-$${retencionISSS.toFixed(2)}`;
  document.getElementById('lblAFP').textContent = `-$${retencionAFP.toFixed(2)}`;
  document.getElementById('lblRenta').textContent = `-$${retencionRenta.toFixed(2)}`;
  document.getElementById('lblTotalNeto').textContent = `$${totalNetoPagar.toFixed(2)}`;


    // --- MOSTRAR RESULTADOS EN PANTALLA ---
    document.getElementById('lblAntiguedad').textContent = `${aniosLaborados} años, ${diasDespuesUltimoAnio} días`;
    document.getElementById('lblSalarioDiario').textContent = `$${salarioBasicoDiario.toFixed(2)}`;
    // Mostrar datos del trabajador en el resumen
    let textoTrabajador = nombreEmpleado || 'Anonimo';

    const lblTrabajador = document.getElementById('lblNombreTrabajador');
    if (lblTrabajador) lblTrabajador.textContent = textoTrabajador;

    const lblDUI = document.getElementById('lblDUI');
    if (lblDUI) lblDUI.textContent = duiEmpleado || '--';

    // Días calculados de vacaciones y aguinaldo
    document.getElementById('lblDiasVacacion').textContent = `${diasProporcionalesVacacion} días`;
    document.getElementById('lblDiasAguinaldo').textContent = `${diasProporcionalesAguinaldo} días`;

    // Prestaciones principales
    document.getElementById('lblIndemnizacion').textContent = `$${indemnizacionTotal.toFixed(2)}`;
    document.getElementById('lblAguinaldo').textContent = `$${aP.toFixed(2)}`;
    document.getElementById('lblVacaciones').textContent = `$${montoFinalVacacion.toFixed(2)}`;

    // Desglose individual de horas y asuetos
    document.getElementById('lblHorasDiurnas').textContent = `$${hE.toFixed(2)}`;
    document.getElementById('lblHorasNocturnas').textContent = `$${hN.toFixed(2)}`;
    document.getElementById('lblDiasAsueto').textContent = `$${sE.toFixed(2)}`;
    document.getElementById('lblDescansoSemanal').textContent = `$${sDD.toFixed(2)}`;

    // Total Bruto
    document.getElementById('lblTotalBruto').textContent = `$${totalBruto.toFixed(2)}`;
    // Mostrar el botón de PDF una vez completado el cálculo sin errores
    const btnPDF = document.getElementById('btnExportarPDF');
    const btnNuevo = document.getElementById('btnNuevoFiniquito');
    if (btnPDF) btnPDF.style.display = 'block';
    if (btnNuevo) btnNuevo.style.display = 'block';
}

// El evento submit permite que el navegador valide los campos required antes de calcular.
document.getElementById('formularioLiquidacion').addEventListener('submit', function(event) {
  event.preventDefault();
  procesarLiquidacion();
});

document.getElementById('formularioLiquidacion').addEventListener('input', function() {
  const btnPDF = document.getElementById('btnExportarPDF');
  if (btnPDF) btnPDF.style.display = 'none';
});


// --- FUNCIÓN PARA REINICIAR LA CALCULADORA ---
document.getElementById('btnNuevoFiniquito').addEventListener('click', function() {
  // 1. Limpiar todos los campos del formulario
  const form = document.getElementById('formularioLiquidacion');
  if (form) form.reset();

  // 2. Restablecer valores numéricos con defaultValue
  document.getElementById('horasExtrasDiurnas').value = '0';
  document.getElementById('horasExtrasNocturnas').value = '0';
  document.getElementById('diasAsueto').value = '0';
  document.getElementById('diasDescanso').value = '0';

  // 3. Ocultar campo condicional de preaviso y mensajes de error
  const campoPreaviso = document.getElementById('campoPreaviso');
  if (campoPreaviso) campoPreaviso.style.display = 'none';

  const contenedorError = document.getElementById('mensajeError');
  if (contenedorError) {
    contenedorError.style.display = 'none';
    contenedorError.textContent = '';
  }

  // 4. Restablecer el panel de resultados a valores iniciales
  const setTexto = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };

  setTexto('lblNombreTrabajador', '--');
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

  // 5. Volver a ocultar los botones de PDF y reinicio
  this.style.display = 'none';
  const btnPDF = document.getElementById('btnExportarPDF');
  if (btnPDF) btnPDF.style.display = 'none';

  // 6. Subir el foco al primer campo
  document.getElementById('nombreEmpleado')?.focus();
});