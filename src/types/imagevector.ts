// ImageVector Generation Configuration and Options

export type ImageVectorFormat = 
  | 'property'     // val IconName: ImageVector get() = ...
  | 'remember'     // @Composable fun rememberIconName(): ImageVector
  | 'builderOnly'  // ImageVector.Builder(...) ...
  | 'materialIcon' // Material Icons style backing field
  | 'multiplatform'; // Compose Multiplatform standard

export interface ImageVectorConfig {
  name: string;
  packageName: string;
  generateImports: boolean;
  format: ImageVectorFormat;
  defaultWidthDp: number;
  defaultHeightDp: number;
  useColorClass: boolean; // Color(0xFF...) vs MaterialTheme.colorScheme
  indentSpaces: number;
  optimizeCurves: boolean;
  flattenGroups: boolean;
}

export const DEFAULT_IMAGE_VECTOR_CONFIG: ImageVectorConfig = {
  name: 'MyIcon',
  packageName: 'com.example.ui.theme.icons',
  generateImports: true,
  format: 'materialIcon',
  defaultWidthDp: 24,
  defaultHeightDp: 24,
  useColorClass: true,
  indentSpaces: 4,
  optimizeCurves: true,
  flattenGroups: false,
};
