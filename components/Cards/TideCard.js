import React from "react";

import { Box, Grid, Typography } from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import { makeStyles } from "@material-ui/core/styles";
import { grey, green } from "@material-ui/core/colors";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  cardBox: {
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: grey[300],
    borderRadius: 5,
    height: "100%",
  },
}));

const TideCard = (props) => {
  const firstDataPointDate = new Date(
    props.tidePredictionData.predictions[0].t
  );
  const domain = new Date(
    firstDataPointDate.getFullYear(),
    firstDataPointDate.getMonth(),
    firstDataPointDate.getDate()
  );

  const predictionData = props.tidePredictionData.predictions.map(
    ({ t, v }) => ({
      time: new Date(t),
      timeNumber: new Date(t).getTime(),
      prediction: v,
    })
  );

  let data = predictionData;
  let { highTide, lowTide, nextTideIsLow } = getTideTimes(
    predictionData,
    props.tideActualData
  );

  if (props.tideActualData && props.tideActualData.data) {
    data = predictionData.map((obj) => ({
      ...obj,
      ...props.tideActualData.data
        .map(({ t, v }) => ({
          time: new Date(t),
          timeNumber: new Date(t).getTime(),
          actual: v,
        }))
        .find((item) => item.timeNumber === obj.timeNumber),
    }));
  }

  const classes = useStyles();

  return (
    <Box
      p={2}
      className={classes.cardBox}
      display={"flex"}
      flexDirection={"column"}
    >
      <Grid item container justify={"space-between"}>
        <Grid item>
          <Typography style={{ fontSize: 32, fontWeight: 500 }}>
            Tide
          </Typography>
        </Grid>
        <Grid item>
          {lowTide && highTide ? (
            <Grid
              container
              spacing={3}
              justify={"center"}
              alignItems={"center"}
            >
              <Grid item>
                <TideTime
                  tide={nextTideIsLow ? "low" : "high"}
                  data={nextTideIsLow ? lowTide : highTide}
                />
              </Grid>
              <Grid item>
                <TideTime
                  tide={nextTideIsLow ? "high" : "low"}
                  data={nextTideIsLow ? highTide : lowTide}
                />
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      <Box pt={2} flexGrow={1}>
        <TideGraph
          data={data}
          domain={domain}
          predictionData={predictionData}
          tideActualData={props.tideActualData}
        />
      </Box>
    </Box>
  );
};

const TideTime = (props) => {
  const Icon = props.tide === "low" ? ArrowDownwardIcon : ArrowUpwardIcon;
  return (
    <Grid container justify={"center"} alignItems={"center"} spacing={1}>
      <Icon style={{ fontSize: 20 }} />
      <Grid item>
        <Typography style={{ fontSize: 20, fontWeight: 400 }}>
          {moment(props.data.getTime()).format("h:mm A")}
        </Typography>
      </Grid>
    </Grid>
  );
};

const TideGraph = (props) => {
  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <LineChart
        data={props.data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis
          dataKey="timeNumber"
          type="number"
          scale="time"
          interval="preserveStartEnd"
          minTickGap={40}
          tickFormatter={(tickItem) => moment(tickItem).format("h:mm A")}
          domain={[props.domain.getTime(), props.domain.getTime()]}
        />
        <YAxis
          hide
          scale={"linear"}
          domain={[
            Math.floor(
              Math.min(...props.predictionData.map((item) => item.prediction))
            ),
            Math.ceil(
              Math.max(...props.predictionData.map((item) => item.prediction))
            ),
            ,
          ]}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <ReferenceLine
          x={new Date().getTime()}
          stroke={green[500]}
          strokeWidth={2}
        />
        <Line
          name="Predicted"
          type="monotone"
          dataKey="prediction"
          stroke="#8884d8"
          dot={false}
          strokeWidth={4}
        />
        {props.tideActualData ? (
          <Line
            name="Actual"
            type="monotone"
            dataKey="actual"
            stroke="#82ca9d"
            dot={false}
            strokeWidth={4}
          />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  );
};

const getTideTimes = (predictionData, actualData) => {
  if (!actualData || !actualData.data)
    return { highTide: null, lowTide: null, nextTideIsLow: null };

  let i = 0;
  const lastActualDate = new Date(
    actualData.data[actualData.data.length - 1].t
  );

  for (; i < predictionData.length; i++) {
    if (predictionData[i].time > lastActualDate) break;
  }

  let graphStartsDown =
    predictionData[i].prediction > predictionData[i + 1].prediction;
  let firstInflectionPoint = predictionData[i + 1];

  for (i += 2; i < predictionData.length; i++) {
    const nextDataPointIsBelow =
      firstInflectionPoint.prediction > predictionData[i].prediction;

    if (graphStartsDown !== nextDataPointIsBelow) break;

    firstInflectionPoint = predictionData[i];
  }

  let secondInflectionPoint = firstInflectionPoint;

  for (; i < predictionData.length; i++) {
    const nextDataPointIsBelow =
      secondInflectionPoint.prediction > predictionData[i].prediction;

    if (!graphStartsDown !== nextDataPointIsBelow) break;

    secondInflectionPoint = predictionData[i];
  }

  const highTide = graphStartsDown
    ? secondInflectionPoint.time
    : firstInflectionPoint.time;
  const lowTide = graphStartsDown
    ? firstInflectionPoint.time
    : secondInflectionPoint.time;

  const nextTideIsLow = lowTide < highTide ? lowTide : highTide;

  return { highTide, lowTide, nextTideIsLow };
};

export default TideCard;
