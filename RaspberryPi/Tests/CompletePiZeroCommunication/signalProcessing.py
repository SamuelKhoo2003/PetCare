import statistics
import math

def filterSignal(rawData):
    bufferSize = 3
    arrayLength = len(rawData)

    # Computation for variable sized buffer of the past 10 samples:
    if arrayLength<bufferSize:
        count = arrayLength
    else:
        count = bufferSize
    
    return statistics.median(rawData[arrayLength-count:arrayLength])