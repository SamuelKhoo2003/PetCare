import statistics

def AEECalculation(svmArray, k, m):
    AEE_10 = 0
    for i in range(len(svmArray)):
        AEE_10 = AEE_10 + k*m*svmArray[i]
    return AEE_10

def sleepStateCheck(svmArray, meanThreshold, varianceThreshold):
    svmMean = statistics.mean(svmArray)
    svmVar = statistics.variance(svmArray)
    return (svmMean < meanThreshold) and (svmVar < varianceThreshold)
    # 1 - Potentially sleeping # 0 - Definitely not sleeping