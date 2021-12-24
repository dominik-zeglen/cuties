import Color from "color";

export const theme = {
  primary: Color.rgb(151, 255, 125),
  secondary: Color.rgb(243, 12, 41),
  tertiary: Color.rgb(255, 196, 0),
  background: Color.rgb(0, 0, 0),
  entities: {
    cutie: Color.rgb(151, 255, 125).rotate(-180),
    dump: Color.rgb(128, 87, 0),
    egg: Color.rgb(255, 255, 255).darken(0.4),
    remains: Color.rgb(243, 12, 41),
  },
  spacing: 8,
  text: {
    primary: Color.rgb(151, 255, 125),
    secondary: Color.rgb(255, 255, 255).darken(0.6),
  },
  transition: "200ms",
};
