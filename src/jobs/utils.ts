export const uuidv4 = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const print = {
  log: (text: string) => console.log("\x1b[37m%s \x1b[2m%s\x1b[0m", ">", text),
  danger: (text: string) =>
    console.log("\x1b[31m%s \x1b[31m%s\x1b[0m", ">", text),
  tip: (text: string) => console.log("\x1b[36m%s \x1b[36m%s\x1b[0m", ">", text),
};

export const TimestampToDate = (Timestamp: number) => {
  let now = new Date(Timestamp),
    y = now.getFullYear(),
    m = now.getMonth() + 1,
    d = now.getDate();
  return (
    y +
    "-" +
    (m < 10 ? "0" + m : m) +
    "-" +
    (d < 10 ? "0" + d : d) +
    " " +
    now.toTimeString().substr(0, 8)
  );
};
