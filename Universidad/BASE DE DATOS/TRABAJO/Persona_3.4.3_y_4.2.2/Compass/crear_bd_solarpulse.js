// =====================================================================
// SolarPulse IoT - Base de datos no relacional (MongoDB)
// Crea las 14 colecciones del diagrama de documentos (sección 4.2.2),
// inserta documentos de ejemplo y los índices sobre los campos de
// referencia, para que MongoDB Compass pueda generar el diagrama
// entidad-relación (pestaña Data Modeling).
//
// Uso: abrir el shell de Compass (botón ">_ Open MongoDB shell") o mongosh
// y ejecutar:  load("ruta/a/crear_bd_solarpulse.js")
// =====================================================================

db = db.getSiblingDB("SolarPulseIoT");
db.dropDatabase();

const id = (hex) => ObjectId(hex.padStart(24, "0"));
const dec = (valor) => NumberDecimal(valor);

// ---------------------------------------------------------------- catálogos
const ROL_ADMIN = id("a1"), ROL_TECNICO = id("a2"), ROL_CLIENTE = id("a3");
db.roles.insertMany([
  { _id: ROL_ADMIN, nombre_rol: "Administrador", descripcion: "Gestiona toda la plataforma",
    permisos: [ { codigo: "USUARIO_GESTIONAR", descripcion: "Crear y editar usuarios" },
                { codigo: "ORDEN_ASIGNAR", descripcion: "Asignar órdenes a técnicos" } ] },
  { _id: ROL_TECNICO, nombre_rol: "Técnico", descripcion: "Atiende órdenes de mantenimiento",
    permisos: [ { codigo: "ORDEN_VER", descripcion: "Ver órdenes asignadas" },
                { codigo: "ACTIVIDAD_REGISTRAR", descripcion: "Registrar actividades realizadas" } ] },
  { _id: ROL_CLIENTE, nombre_rol: "Cliente", descripcion: "Consulta sus instalaciones",
    permisos: [ { codigo: "TABLERO_VER", descripcion: "Ver tablero de su instalación" } ] }
]);

const CLI_1 = id("b1"), CLI_2 = id("b2");
db.clientes.insertMany([
  { _id: CLI_1, razon_social: "Agroindustrias del Sur S.A.C.", tipo_documento: "RUC",
    nro_documento: "20512345671", direccion_fiscal: "Av. Industrial 450, Arequipa",
    telefono_contacto: "054123456", email_contacto: "contacto@agrosur.pe" },
  { _id: CLI_2, razon_social: "Ana Ríos Paredes", tipo_documento: "DNI",
    nro_documento: "45678912", direccion_fiscal: "Jr. Los Pinos 123, Lima",
    telefono_contacto: "987654321", email_contacto: "ana.rios@correo.pe" }
]);

const TAR_1 = id("c1"), TAR_2 = id("c2");
db.tarifas.insertMany([
  { _id: TAR_1, tipo_tarifa: "BT5B", costo_kwh: dec("0.7850"), moneda: "PEN", distribuidora: { nombre: "Luz del Sur" } },
  { _id: TAR_2, tipo_tarifa: "MT3", costo_kwh: dec("0.5420"), moneda: "PEN", distribuidora: { nombre: "SEAL" } }
]);

const FAC_1 = id("d1");
db.factores_emision.insertMany([
  { _id: FAC_1, nombre_red: "SEIN", kg_co2_kwh: 0.2550, anio_vigencia: 2026 }
]);

const MOD_1 = id("e1"), MOD_2 = id("e2");
db.modelos_panel.insertMany([
  { _id: MOD_1, marca: "Jinko Solar", modelo: "Tiger Neo 580", potencia_nominal_w: 580 },
  { _id: MOD_2, marca: "Canadian Solar", modelo: "HiKu6 450", potencia_nominal_w: 450 }
]);

const REP_1 = id("f1"), REP_2 = id("f2");
db.repuestos.insertMany([
  { _id: REP_1, codigo_sku: "MC4-01", nombre: "Conector MC4", stock_actual: 120, costo_unitario_estandar: dec("18.50") },
  { _id: REP_2, codigo_sku: "FUS-15A", nombre: "Fusible DC 15A", stock_actual: 60, costo_unitario_estandar: dec("12.00") }
]);

// ---------------------------------------------------------------- usuarios
const USR_ADMIN = id("11"), USR_TEC = id("12"), USR_CLI = id("13");
db.usuarios.insertMany([
  { _id: USR_ADMIN, nombre_completo: "Carla Mendoza", email: "cmendoza@heliosync.pe",
    password_hash: "$2b$10$hashDeEjemplo1", telefono: "999111222", estado: "Activo", intentos_fallidos: 0,
    rol: { rol_id: ROL_ADMIN, nombre_rol: "Administrador" } },
  { _id: USR_TEC, nombre_completo: "Luis Paredes", email: "lparedes@heliosync.pe",
    password_hash: "$2b$10$hashDeEjemplo2", telefono: "999333444", estado: "Activo", intentos_fallidos: 0,
    rol: { rol_id: ROL_TECNICO, nombre_rol: "Técnico" },
    perfil_tecnico: { codigo_empleado: "TEC-014", disponibilidad: "Disponible", calificacion_promedio: 4.6,
                      especialidades: [ "Alta tensión", "Redes IoT" ] } },
  { _id: USR_CLI, nombre_completo: "Ana Ríos Paredes", email: "ana.rios@correo.pe",
    password_hash: "$2b$10$hashDeEjemplo3", telefono: "987654321", estado: "Activo", intentos_fallidos: 0,
    rol: { rol_id: ROL_CLIENTE, nombre_rol: "Cliente" }, cliente_id: CLI_2 }
]);

// ---------------------------------------------------------------- instalaciones
const INS_1 = id("21"), INS_2 = id("22");
const PAN_1 = id("31"), PAN_2 = id("32"), PAN_3 = id("33");
const SEN_1 = id("41"), SEN_2 = id("42"), SEN_3 = id("43");
const ALE_1 = id("71");
db.instalaciones.insertMany([
  { _id: INS_1, nombre: "Planta Arequipa Norte",
    ubicacion: { type: "Point", coordinates: [ -71.5375, -16.4090 ] },
    direccion: "Parque Industrial Río Seco, Arequipa", capacidad_nominal_kw: 1.03, potencia_contratada_kw: 15,
    fecha_puesta_marcha: ISODate("2025-03-15T00:00:00Z"), estado_operativo: "Operativa",
    cliente: { cliente_id: CLI_1, razon_social: "Agroindustrias del Sur S.A.C." },
    tarifa: { tarifa_id: TAR_2, tipo_tarifa: "MT3" },
    factor_emision: { factor_emision_id: FAC_1, nombre_red: "SEIN" },
    paneles: [
      { panel_id: PAN_1, codigo_serie: "JK-2025-0001", angulo_inclinacion: 15, orientacion: "Norte", estado: "Óptimo",
        modelo: { modelo_panel_id: MOD_1, marca: "Jinko Solar", modelo: "Tiger Neo 580", potencia_nominal_w: 580 },
        sensores: [ { sensor_id: SEN_1, identificador_hardware: "ESP32-A1", mac_address: "AA:BB:CC:00:00:01",
                      tipo_sensor: "Corriente/Voltaje DC", frecuencia_muestreo_seg: 60, estado_conexion: "Online" } ] },
      { panel_id: PAN_2, codigo_serie: "CS-2025-0002", angulo_inclinacion: 15, orientacion: "Norte", estado: "Degradado",
        modelo: { modelo_panel_id: MOD_2, marca: "Canadian Solar", modelo: "HiKu6 450", potencia_nominal_w: 450 },
        sensores: [ { sensor_id: SEN_2, identificador_hardware: "ESP32-A2", mac_address: "AA:BB:CC:00:00:02",
                      tipo_sensor: "Corriente/Voltaje DC", frecuencia_muestreo_seg: 60, estado_conexion: "Online" } ] }
    ],
    alertas_recientes: [ { alerta_id: ALE_1, fecha_generacion: ISODate("2026-11-10T10:12:00Z"),
                           mensaje: "El panel CS-2025-0002 produce 35 % menos de lo esperado" } ],
    resumen: { total_paneles: 2, paneles_operativos: 2, ultima_medicion: ISODate("2026-11-10T10:59:00Z") } },
  { _id: INS_2, nombre: "Casa Ríos",
    ubicacion: { type: "Point", coordinates: [ -77.0282, -12.1211 ] },
    direccion: "Jr. Los Pinos 123, Lima", capacidad_nominal_kw: 0.58, potencia_contratada_kw: 5,
    fecha_puesta_marcha: ISODate("2026-01-20T00:00:00Z"), estado_operativo: "Operativa",
    cliente: { cliente_id: CLI_2, razon_social: "Ana Ríos Paredes" },
    tarifa: { tarifa_id: TAR_1, tipo_tarifa: "BT5B" },
    factor_emision: { factor_emision_id: FAC_1, nombre_red: "SEIN" },
    paneles: [
      { panel_id: PAN_3, codigo_serie: "JK-2026-0103", angulo_inclinacion: 12, orientacion: "Norte", estado: "Óptimo",
        modelo: { modelo_panel_id: MOD_1, marca: "Jinko Solar", modelo: "Tiger Neo 580", potencia_nominal_w: 580 },
        sensores: [ { sensor_id: SEN_3, identificador_hardware: "ESP32-B1", mac_address: "AA:BB:CC:00:01:01",
                      tipo_sensor: "Temperatura de celda", frecuencia_muestreo_seg: 60, estado_conexion: "Online" } ] }
    ],
    alertas_recientes: [],
    resumen: { total_paneles: 1, paneles_operativos: 1, ultima_medicion: ISODate("2026-11-10T10:59:00Z") } }
]);

// ---------------------------------------------------------------- series de tiempo (patrón Bucket)
db.mediciones.insertMany([
  { _id: id("51"), sensor_id: SEN_1, panel_id: PAN_1, instalacion_id: INS_1,
    fecha_inicio: ISODate("2026-11-10T10:00:00Z"), fecha_fin: ISODate("2026-11-10T10:59:59Z"), num_lecturas: 2,
    lecturas: [
      { timestamp_registro: ISODate("2026-11-10T10:00:00Z"), voltaje_v: 41.2, corriente_a: 13.1, temperatura_celda_c: 44.5, irradiancia_w_m2: 905 },
      { timestamp_registro: ISODate("2026-11-10T10:01:00Z"), voltaje_v: 41.0, corriente_a: 13.0, temperatura_celda_c: 44.8, irradiancia_w_m2: 898 } ],
    resumen: { voltaje_prom: 41.1, corriente_prom: 13.05, potencia_max_w: 539.7, energia_wh: 8.9, temperatura_max_c: 44.8 } },
  { _id: id("52"), sensor_id: SEN_2, panel_id: PAN_2, instalacion_id: INS_1,
    fecha_inicio: ISODate("2026-11-10T10:00:00Z"), fecha_fin: ISODate("2026-11-10T10:59:59Z"), num_lecturas: 2,
    lecturas: [
      { timestamp_registro: ISODate("2026-11-10T10:00:00Z"), voltaje_v: 30.1, corriente_a: 8.9, temperatura_celda_c: 52.3, irradiancia_w_m2: 905 },
      { timestamp_registro: ISODate("2026-11-10T10:01:00Z"), voltaje_v: 29.8, corriente_a: 8.7, temperatura_celda_c: 52.9, irradiancia_w_m2: 898 } ],
    resumen: { voltaje_prom: 29.95, corriente_prom: 8.8, potencia_max_w: 267.9, energia_wh: 4.4, temperatura_max_c: 52.9 } }
]);

db.consumos_energia.insertMany([
  { _id: id("61"), instalacion_id: INS_2, fecha: ISODate("2026-11-10T00:00:00Z"), intervalo_min: 15,
    registros: [ { fecha_hora: ISODate("2026-11-10T00:00:00Z"), energia_consumida_kwh: 0.12 },
                 { fecha_hora: ISODate("2026-11-10T00:15:00Z"), energia_consumida_kwh: 0.10 } ],
    resumen: { energia_total_kwh: 0.22, pico_kwh: 0.12 } }
]);

// ---------------------------------------------------------------- cadena anomalía → alerta → incidencia → orden
const ANO_1 = id("81");
db.anomalias.insertMany([
  { _id: ANO_1, sensor_id: SEN_2, panel_id: PAN_2, instalacion_id: INS_1,
    fecha_deteccion: ISODate("2026-11-10T10:10:00Z"), tipo_anomalia: "Degradación",
    valor_esperado: 410.0, valor_leido: 267.9, severidad: "Alta" }
]);

db.alertas.insertMany([
  { _id: ALE_1, anomalia: { anomalia_id: ANO_1, tipo_anomalia: "Degradación", severidad: "Alta" },
    instalacion: { instalacion_id: INS_1, nombre: "Planta Arequipa Norte" },
    fecha_generacion: ISODate("2026-11-10T10:12:00Z"),
    mensaje: "El panel CS-2025-0002 produce 35 % menos de lo esperado",
    recomendacion: "Revisar suciedad o sombra sobre el panel", canal_envio: "Push", estado: "No leída" }
]);

const INC_1 = id("91");
db.incidencias.insertMany([
  { _id: INC_1, alerta_id: ALE_1, anomalia_id: ANO_1,
    instalacion: { instalacion_id: INS_1, nombre: "Planta Arequipa Norte" },
    titulo: "Caída de producción en panel CS-2025-0002", descripcion_detallada: "Pérdida sostenida de potencia desde las 10:00",
    prioridad: "Alta", estado: "En mantenimiento", fecha_apertura: ISODate("2026-11-10T10:15:00Z"), fecha_cierre: null,
    tiempo_inactivo_min: 45, perdida_estimada_pen: dec("38.20") }
]);

db.ordenes_mantenimiento.insertMany([
  { _id: id("a01"), incidencia_id: INC_1,
    instalacion: { instalacion_id: INS_1, nombre: "Planta Arequipa Norte", direccion: "Parque Industrial Río Seco, Arequipa" },
    tipo_mantenimiento: "Correctivo", fecha_programada: ISODate("2026-11-11T09:00:00Z"),
    fecha_ejecucion: ISODate("2026-11-11T09:30:00Z"), estado: "Completada",
    tecnico: { usuario_id: USR_TEC, nombre_completo: "Luis Paredes", codigo_empleado: "TEC-014" },
    actividades: [
      { actividad_id: id("a11"), tecnico: { usuario_id: USR_TEC, nombre_completo: "Luis Paredes" },
        descripcion_tarea: "Limpieza del panel y cambio de conector MC4", tiempo_estimado_min: 30, tiempo_real_min: 42,
        resultado: "Exitosa", observaciones: "Conector con signos de corrosión" } ],
    presupuesto: [
      { repuesto: { repuesto_id: REP_1, codigo_sku: "MC4-01", nombre: "Conector MC4" },
        cantidad: dec("2"), precio_unitario: dec("18.50"), subtotal: dec("37.00") } ],
    costo: { costo_mano_obra: dec("120.00"), costo_materiales_repuestos: dec("37.00"),
             costo_adicional_viaticos: dec("25.00"), costo_total: dec("182.00"), moneda: "PEN",
             fecha_registro_costo: ISODate("2026-11-11T12:00:00Z") } }
]);

// ---------------------------------------------------------------- índices
// Compass infiere las relaciones del diagrama a partir de los campos indexados que guardan referencias.
db.usuarios.createIndex({ email: 1 }, { unique: true });
db.usuarios.createIndex({ "rol.rol_id": 1 });
db.usuarios.createIndex({ cliente_id: 1 });
db.clientes.createIndex({ nro_documento: 1 }, { unique: true });
db.repuestos.createIndex({ codigo_sku: 1 }, { unique: true });
db.instalaciones.createIndex({ "cliente.cliente_id": 1 });
db.instalaciones.createIndex({ "tarifa.tarifa_id": 1 });
db.instalaciones.createIndex({ "factor_emision.factor_emision_id": 1 });
db.instalaciones.createIndex({ "paneles.modelo.modelo_panel_id": 1 });
db.instalaciones.createIndex({ "paneles.sensores.sensor_id": 1 });
db.instalaciones.createIndex({ ubicacion: "2dsphere" });
db.mediciones.createIndex({ sensor_id: 1, fecha_inicio: 1 });
db.mediciones.createIndex({ instalacion_id: 1, fecha_inicio: 1 });
db.consumos_energia.createIndex({ instalacion_id: 1, fecha: 1 }, { unique: true });
db.anomalias.createIndex({ instalacion_id: 1 });
db.alertas.createIndex({ "anomalia.anomalia_id": 1 });
db.alertas.createIndex({ "instalacion.instalacion_id": 1, fecha_generacion: -1 });
db.incidencias.createIndex({ alerta_id: 1 });
db.incidencias.createIndex({ anomalia_id: 1 });
db.incidencias.createIndex({ "instalacion.instalacion_id": 1 });
db.ordenes_mantenimiento.createIndex({ incidencia_id: 1 });
db.ordenes_mantenimiento.createIndex({ "instalacion.instalacion_id": 1, fecha_programada: -1 });
db.ordenes_mantenimiento.createIndex({ "tecnico.usuario_id": 1 });
db.ordenes_mantenimiento.createIndex({ "presupuesto.repuesto.repuesto_id": 1 });

print("Base SolarPulseIoT creada con " + db.getCollectionNames().length + " colecciones.");
