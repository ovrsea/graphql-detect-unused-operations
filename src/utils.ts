export const coloredLog = (message: string, isRed?: true) => {
  console.log(`\x1b[${isRed ? 31 : 32}m%s\x1b[0m`, message);
};
