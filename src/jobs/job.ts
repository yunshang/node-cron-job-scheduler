import * as schedule from "node-schedule";
const crypto = require("crypto");
const humps = require("humps");
import { uuidv4, TimestampToDate, print } from "./utils";
import request from "../request";
import testModel from "../schema/test.model";
const deviceCount = 10;
const hosts = [
  "127.0.0.1:31041",
  "127.0.0.1:31042",
  "127.0.0.1:31043",
  "127.0.0.1:31044",
  "127.0.0.1:31045",
  "127.0.0.1:31046",
  "127.0.0.1:31047",
  "127.0.0.1:31048",
];

let paasHost: any = Object;
class Job {
  public storeUser: any = Object;
  constructor() {}
  public refresh() {
    schedule.scheduleJob("*/50 * * * * *", this.cb);
    // this.cb();
  }
  initUuid = async () => {
    for (let i = 0; i < deviceCount; i++) {
      const uuid = crypto.randomBytes(16).toString("hex");
      const trace_id = uuidv4();
      this.storeUser[i] = { uuid, trace_id };
      const random = (i + 1) % hosts.length;
      const host = hosts[random];
      paasHost[trace_id] = host;
      await fetchWechatPosition(initPayload(uuid, trace_id));
      console.log(`init ${uuid} with trace id ${trace_id}`);
    }
  };

  cb = async () => {
    let arr = new Array(deviceCount).fill("").map((_, i) => i);
    arr.forEach((i) => {
      const store = this.storeUser[i];
      const uuid = store["uuid"];
      const trace_id = store["trace_id"];
      console.log(`Loop index is ${i}`);
      const start = Number(
        Date.now() + String(process.hrtime()[1]).slice(3, 6)
      );
      fetchWechatPosition(payload(uuid, trace_id))
        .then((data) => {
          if (!data) {
            print.danger("fetch error");
            return;
          }
          if (data?.code === 400 && data?.errmsg === "TraceStateEmptyError") {
            // trace state error
            print.danger(`${uuid}fetch position error! trace start empty`);
            return;
          }
          if (data.floor === null) {
            print.danger(`${uuid} fetch position error! floor is unknown`);
            return;
          }
          if (data.position) {
            const mode = new testModel({
              uuid,
              code: data.code,
              floor: data.floor.id,
              message: data.message,
              position: data.position.point,
              site: data.site.id,
              timestamp: TimestampToDate(data.timestamp),
              trace_id: data.trace_id,
            });
            mode
              .save()
              .then((doc) => {
                console.log(
                  `${uuid} position success on index ${i}, benchmark took ${
                    (Number(
                      Date.now() + String(process.hrtime()[1]).slice(3, 6)
                    ) -
                      start) /
                    1000
                  } ms`
                );
              })
              .catch((err) => {
                console.log(`${uuid} position error on index ${i}`);
              });
          }
        })
        .catch((err) => {
          print.danger(`${uuid} fetch position error ${err}`);
        });
    });
  };
}

const payload = (uuid: string, trace_id: string) => {
  const params = {
    uuid,
    trace_id,
    trace_action: "move",
    init_config: {
      os_type: "ios",
      init_site: "6148a6e7a7ffd0001c81def9",
      trace_extra: null,
      trace_type: "follow_by_wechat2",
      trace_mode: "follow",
      fast_load_map: true,
    },
    trace_config: {
      nav_status: false,
      is_auto_find_site: false,
      is_auto_find_floor: true,
      auto_find_site_interval: 60000,
      auto_find_floor_interval: 1000,
      auto_find_position_interval: 1000,
    },
    resource: {
      ibeacon_list: [
        [
          1669706558784,
          "181A0BC3-20DA-4D26-9475-05C716352B76",
          "13601",
          "11444",
          2,
          -54,
          0,
        ],
        [
          1669706558784,
          "181A0BC3-20DA-4D26-9475-05C716352B76",
          "13601",
          "12558",
          2,
          -67,
          0,
        ],
        [
          1669706558784,
          "181A0BC3-20DA-4D26-9475-05C716352B76",
          "13601",
          "11443",
          2,
          -87,
          0,
        ],
        [
          1669706558784,
          "181A0BC3-20DA-4D26-9475-05C716352B76",
          "13601",
          "11481",
          2,
          -91,
          0,
        ],
        [
          1669706558784,
          "181A0BC3-20DA-4D26-9475-05C716352B76",
          "13601",
          "12072",
          2,
          -91,
          0,
        ],
      ],
      compass_list: [],
      gps: null,
    },
  };
  return params;
};

const defaultTraceConfig = {
  is_auto_find_site: false,
  is_auto_find_floor: true,
  auto_find_site_interval: 60000,
  auto_find_floor_interval: 1000,
  auto_find_position_interval: 1000,
};

const fetchWechatPosition = async ({
  uuid,
  trace_id,
  trace_action,
  init_config,
  resource,
  trace_config,
}: any) => {
  try {
    const url = paasHost[trace_id];
    const { data } = await request.post(`${url}/follow`, {
      uuid,
      trace_id,
      trace_action,
      init_config: humps.decamelizeKeys(init_config),
      resource: humps.decamelizeKeys(resource),
      trace_config: humps.decamelizeKeys({
        ...trace_config,
        ...defaultTraceConfig,
      }),
    });
    return data;
  } catch (e: any) {
    console.log("fetch error", JSON.stringify(e));
  }
};

const initPayload = (uuid: string, trace_id: string) => {
  return {
    uuid,
    trace_id,
    trace_action: "start",
    init_config: {
      os_type: "pc",
      init_site: "623d880e198cbe001b6973b4",
      trace_extra: null,
      trace_type: "follow_by_industry",
      trace_mode: "follow",
      fast_load_map: true,
    },
    trace_config: {
      is_auto_find_site: false,
      is_auto_find_floor: true,
      auto_find_site_interval: 60000,
      auto_find_floor_interval: 1000,
      auto_find_position_interval: 1000,
    },
  };
};

export default new Job();
