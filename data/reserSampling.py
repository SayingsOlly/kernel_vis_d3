import sys
from random import randint

def reserSampling(fileName, size, epsilon):
    size = int(size)
    contentList = readFile(fileName)
    sampleList = []
    for i in xrange(size):
        sampleList.append(contentList[i])

    for i in range(size, len(contentList)):
        j = randint(0,i)
        if(j<size):
            sampleList[j] = contentList[i]


    writeFile(fileName, sampleList, size)


#
# Input: sampleList
#

def writeFile(fileName, sampleList, size):
    f = open(fileName.split(".")[0]+""+str(size)+'.txt', 'w')
    for sample in sampleList:
        line = str(sample[0])+" "+str(sample[1])
        f.write(line+"\n")
    f.close()
    print "write file done"
#
# Input: fileName
# return list: file content.
#
def readFile(fileName):
    contentList = []
    with open(fileName) as f:
        for line in f:
            content = line.strip(" \n").split(" ")
            contentList.append(content)
    return contentList

if __name__ == '__main__':
    argv = sys.argv[1:]
    reserSampling(argv[0], argv[1], argv[2])
