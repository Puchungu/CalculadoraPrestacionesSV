////////////////////////////INPUTS USUARIO/////////////////////////////////////////////////////////////////
const SalarioMensualNum = parseFloat(document.getElementById('salario').value) || 0;
const fechaInicio = document.getElementById('fechaInicio').value;
const fechaFin = document.getElementById('fechaFin').value;
const ultimaVacacion = document.getElementById('ultimaVacacion').value;
const causaDeFinalizacionNum = parseInt(document.getElementById('causa').value);
const horasExtrasDiurnasNum = parseInt(document.getElementById('horasDiurnas').value) || 0;
const horasExtrasNocturnasNum = parseInt(document.getElementById('horasNocturnas').value) || 0;
const diasAsuetoNum = parseInt(document.getElementById('diasAsueto').value) || 0;
const diasDescansoSemanalNum = parseInt(document.getElementById('diasDescansoSemanal').value) || 0;
const fechaInicioNum = new Date(fechaInicio.replace(/-/g, '/'));
const fechaFinNum = new Date(fechaFin.replace(/-/g, '/'));
const ultimaVacacionNum = new Date(ultimaVacacion.replace(/-/g, '/'));
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//Calcular Salario Basico Diario
const salarioBasicoDiario = SalarioMensualNum / 30;

//Calcular Hora Ordinaria (Sueldo por hora)
const H = salarioBasicoDiario / 8;

//Calcular Hora Extra Diurna (Calculamos la hora extra diurna y se multiplica por el numero de horas extra que trabajo)
const hE = (H * 2)*horasExtrasDiurnasNum; 

//Calcular Hora Extra Nocturna (Calculamos la hora extra nocturna (extra se multiplica por 2) y se multiplica por el numero de horas nocturna (1.25) que trabajo)
const hN = (H * 1.25*2)*horasExtrasNocturnasNum;

////////////CALCULANDO LAS FECHAS ////////////////
const inicio = dayjs(fechaInicioNum);
const fin = dayjs(fechaFinNum);
const ultimaVacacionDate = dayjs(ultimaVacacionNum);
const fechaReincorporacion = ultimaVacacionDate.add(15, 'day');
const diasProporcionalesVacacion = fin.diff(fechaReincorporacion, 'day'); //dias de vacacion desde que regreso de vacaciones hasta la fecha de finalizacion del contrato




//Calculando dias de asueto laborado 
const sE = (salarioBasicoDiario * 2)*diasAsuetoNum;

//Calculando dias de descanso semanal laborado
const sDD = (salarioBasicoDiario * 1.5)*diasDescansoSemanalNum;

//Creamos una variable para el recargo total y validamos si el usuario selecciono alojamiento y/o alimentacion para sumarlo al recargo total
let totalRecargoVacacional = 1.3;
if (document.getElementById('alojamiento').checked) recargoVacacion += 0.25;
if (document.getElementById('alimentacion').checked) recargoVacacion += 0.25;
//Calculando total de vacaciones
const tV = ((salarioBasicoDiario * 15 *totalRecargoVacacional))

//Calculando vacacion proporcional
const vP = (tV*diasProporcionalesVacacion)/365;
//Calculando total de vacaciones, si fueron pagadas o no, si fueron pagadas solo se toma en cuenta el monto de vacaciones proporcional, si no fueron pagadas se toma en cuenta el monto total de vacaciones mas el monto proporcional
const vacacionPagada = document.querySelector("input[name='vacacionPagada']:checked").value;
let montoFinalVacacion = 0;
if (vacacionPagada === "si") {
    montoFinalVacacion = vP;
}else {
    montoFinalVacacion = tV + vP;
}
