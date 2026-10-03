document.getElementById('causa').addEventListener('change', function() {
      const campoPreaviso = document.getElementById('campoPreaviso');
      campoPreaviso.style.display = this.value === '2' ? 'block' : 'none';
    });


function procesarLiquidacion() {
  ////////////////////////////INPUTS USUARIO/////////////////////////////////////////////////////////////////
  const SalarioMensualNum = parseFloat(document.getElementById('salarioMensual').value) || 0;
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  const ultimaVacacion = document.getElementById('fechaUltimaVacacion').value;
  const causaDeFinalizacionNum = parseInt(document.getElementById('causa').value);
  const horasExtrasDiurnasNum = parseInt(document.getElementById('horasExtrasDiurnas').value) || 0;
  const horasExtrasNocturnasNum = parseInt(document.getElementById('horasExtrasNocturnas').value) || 0;
  const diasAsuetoNum = parseInt(document.getElementById('diasAsueto').value) || 0;
  const diasDescansoSemanalNum = parseInt(document.getElementById('diasDescanso').value) || 0;
  
  // Validación mínima para que no intente calcular con fechas vacías
  if (!fechaInicio || !fechaFin || !ultimaVacacion || !SalarioMensualNum) {
    alert("Por favor completa todas las fechas y el salario.");
    return;
  }


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




























    const totalExtrasYAsuetos = hE + hN + sE + sDD;
    const totalBruto = indemnizacionTotal + aP + montoFinalVacacion + totalExtrasYAsuetos;



    // --- MOSTRAR RESULTADOS EN PANTALLA ---
    document.getElementById('lblAntiguedad').textContent = `${aniosLaborados} años, ${diasDespuesUltimoAnio} días`;
    document.getElementById('lblSalarioDiario').textContent = `$${salarioBasicoDiario.toFixed(2)}`;

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
}

// Conectar el botón con la función al hacer clic
document.getElementById('btnCalcular').addEventListener('click', procesarLiquidacion);