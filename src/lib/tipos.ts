export type Categoria = 'originales' | 'decants' | 'inspirados' | 'nicho';
export type Genero = 'femenino' | 'masculino' | 'unisex';
export type Concentracion = 'EDC' | 'EDT' | 'EDP' | 'Parfum' | 'Extracto';
export type Forma = 'rect' | 'redonda' | 'alta' | 'ornada';

export type Variante = {
  /** Identificador único de la variante. Formato: `${slug}-${tamano}` */
  sku: string;
  tamano: string;   // '100ml', '10ml', ...
  precio: number;   // CLP, sin puntos
};

export type Producto = {
  slug: string;
  nombre: string;
  casa: string;                 // marca / casa de perfume
  categoria: Categoria;
  genero: Genero;
  concentracion: Concentracion;
  familia: string;              // familia olfativa principal
  acordes: string[];            // acordes dominantes, para los chips
  notas: {
    salida: string[];
    corazon: string[];
    fondo: string[];
  };
  ocasiones: string[];
  estaciones: string[];
  proyeccion: 1 | 2 | 3 | 4 | 5;
  duracion: 1 | 2 | 3 | 4 | 5;
  descripcion: string;
  variantes: Variante[];
  forma: Forma;
  /** Ruta a la foto real. Si está vacío se dibuja un frasco SVG. */
  img?: string;
  destacado?: boolean;
  /** Solo para la línea "inspirados": perfil de referencia. */
  perfilSimilarA?: string;
};

/** Estado editable desde el panel de administración. */
export type EstadoStock = 'disponible' | 'agotado' | 'encargo';

export type RegistroStock = {
  estado: EstadoStock;
  /** Si está presente, sobrescribe el precio del catálogo. */
  precio?: number;
};

export type MapaStock = Record<string, RegistroStock>;
