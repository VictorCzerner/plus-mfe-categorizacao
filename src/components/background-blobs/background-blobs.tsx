import { Box } from "@mui/material";

// Círculos abstratos em baixa opacidade para dar profundidade ao fundo gradiente
// (padrão visual do Manual de UI do Plus). Extraído para um componente reutilizável.
export function BackgroundBlobs() {
  const blob = (sx: object) => (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        borderRadius: "50%",
        pointerEvents: "none",
        ...sx,
      }}
    />
  );

  return (
    <>
      {blob({ top: -80, right: -80, width: 280, height: 280, background: "rgba(255,255,255,0.13)" })}
      {blob({ bottom: -100, left: -100, width: 340, height: 340, background: "rgba(255,255,255,0.10)" })}
      {blob({ bottom: 30, left: 10, width: 170, height: 170, background: "rgba(255,255,255,0.09)" })}
    </>
  );
}
