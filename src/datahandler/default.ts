/**
 * @license
 * Copyright 2013 David Eberlein (david.eberlein@ch.sauter-bc.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview DataHandler default implementation used for simple line charts.
 * @author David Eberlein (david.eberlein@ch.sauter-bc.com)
 */

import DygraphDataHandler, { UnifiedPoint } from './datahandler';
import { DygraphOptions } from '../dygraph-types';

class DefaultHandler extends DygraphDataHandler {
  constructor() {
    super();
  }

  extractSeries(rawData: number[][], seriesIndex: number, options: DygraphOptions): UnifiedPoint[] {
    // TODO(danvk): pre-allocate series here.
    var series = [];
    var logScale = options.get('logscale');
    for (var j = 0; j < rawData.length; j++) {
      var x = rawData[j][0];
      var point = rawData[j][1];
      if (logScale) {
        // On the log scale, points less than zero do not exist.
        // This will create a gap in the chart.
        if (point <= 0) {
          point = null;
        }
      }
      series.push([x, point]);
    }
    return series;
  }

  rollingAverage(originalData: UnifiedPoint[], rollPeriod: number, options: DygraphOptions): UnifiedPoint[] {
    rollPeriod = Math.min(rollPeriod, originalData.length);
    var rollingData = [];
    var i, j, y, sum, num_ok;
    // Calculate the rolling average for the first rollPeriod - 1 points
    // where
    // there is not enough data to roll over the full number of points
    if (rollPeriod == 1) {
      return originalData;
    }
    for (i = 0; i < originalData.length; i++) {
      sum = 0;
      num_ok = 0;
      for (j = Math.max(0, i - rollPeriod + 1); j < i + 1; j++) {
        y = originalData[j][1];
        if (y === null || isNaN(y))
          continue;
        num_ok++;
        sum += originalData[j][1];
      }
      if (num_ok) {
        rollingData[i] = [originalData[i][0], sum / num_ok];
      }
      else {
        rollingData[i] = [originalData[i][0], null];
      }
    }
    return rollingData;
  }

  getExtremeYValues(series: UnifiedPoint[], dateWindow: [number, number], options: DygraphOptions): [number, number] {
    var minY = null, maxY = null, y;
    var firstIdx = 0, lastIdx = series.length - 1;
    for (var j = firstIdx; j <= lastIdx; j++) {
      y = series[j][1];
      if (y === null || isNaN(y))
        continue;
      if (maxY === null || y > maxY) {
        maxY = y;
      }
      if (minY === null || y < minY) {
        minY = y;
      }
    }
    return [minY, maxY];
  }
}

export default DefaultHandler;
