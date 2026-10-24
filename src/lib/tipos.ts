export type Linea = 'mujer' | 'hombre';
export type Forma = 'rect' | 'redonda' | 'alta' | 'ornada';

export type Variante = {
  /** Identificador único. Formato: `${slug}-${tamano}` */
  sku: string;
  tamano: string;
  precio: number;   // CLP, sin puntos
};

/** La fragancia de marca en la que se inspira el producto. */
export type Referencia = {
  nombre: string;
  casa: string;
};

export type Producto = {
  /** Ej: "54-aventus-creed" — incluye la referencia para posicionamiento. */
  slug: string;
  /** El número de catálogo. Es el nombre real del producto: "Nº 54". */
  numero: number;
  linea: Linea;
  referencia: Referencia;
  familia: string;
  acordes: string[];
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
  /** Ruta a la foto real. Si falta, se dibuja un frasco SVG. */
  img?: string;
  destacado?: boolean;
};

/** Estado editable desde el panel de administración. */
export type EstadoStock = 'disponible' | 'agotado' | 'encargo';

export type RegistroStock = {
  estado: EstadoStock;
  /** Si está presente, sobrescribe el precio del catálogo. */
  precio?: number;
};

export type MapaStock = Record<string, RegistroStock>;
