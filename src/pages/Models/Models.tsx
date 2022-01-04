import React from "react";
import { StyleSheet, css } from "aphrodite";
import { PageContainer } from "../../components/PageContainer";
import { theme } from "../../components/theme";
import { drawCutie } from "../../renderer/paint";
import { Point } from "../../core/r2";
import { Slider } from "../../components/Slider";
import { Switch } from "../../components/Switch";

const canvasSize: Point = {
  x: 1024,
  y: 800,
};
const styles = StyleSheet.create({
  grid: {
    display: "grid",
    gridTemplateColumns: `1fr ${canvasSize.x}px`,
    gap: theme.spacing,
    width: "100%",
  },
});

export interface ModelsPageProps {}

export const ModelsPage: React.FC<ModelsPageProps> = () => {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = React.useState(true);
  const [features, setFeatures] = React.useState({
    angle: 0,
    color: theme.entities.cutie.toString(),
    shape: 1,
  });

  React.useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    const cutie = {
      ...features,
      hunger: 0,
      position: {
        x: canvasSize.x / 2,
        y: canvasSize.y / 2,
      },
    };

    ctx.clearRect(0, 0, canvasSize.x, canvasSize.y);
    drawCutie(ctx, cutie, zoom ? 10 : 1);
  }, [features, zoom]);

  return (
    <PageContainer>
      <div className={css(styles.grid)}>
        <div>
          <label>
            <p>Zoom</p>
            <Switch
              checked={zoom}
              onChange={(event) => setZoom(Boolean(event.target.checked))}
            />
          </label>
          <label>
            <p>Angle</p>
            <Slider
              min="0"
              max={Math.PI * 2}
              step="0.02"
              value={features.angle}
              onChange={(event) =>
                setFeatures({
                  ...features,
                  angle: Number(event.target.value),
                })
              }
            />
          </label>

          <label>
            <p>Shape</p>
            <Slider
              min=".5"
              max={1.3}
              step="0.1"
              value={features.shape}
              onChange={(event) =>
                setFeatures({
                  ...features,
                  shape: Number(event.target.value),
                })
              }
            />
          </label>
        </div>
        <canvas height={canvasSize.y} width={canvasSize.y} ref={canvas} />
      </div>
    </PageContainer>
  );
};
