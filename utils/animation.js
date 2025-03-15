export function loadingAnimation(
  text = "",
  chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"],
  delay = 100
) {
  let x = 0;

  return setInterval(() => {
      process.stdout.write(`\r${chars[x++]} ${text}`);
      x = x % chars.length;
  }, delay);
}