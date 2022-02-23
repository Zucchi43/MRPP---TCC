import csv
from random import Random
from matplotlib import pyplot
import os
import sys


def get_csv():
    folder_location = sys.argv[1]
    files  = os.listdir(folder_location)
    return [files[0], files[2]]

def csv_to_dict(CSV): 
    filename = open(sys.argv[1] + "\\" + CSV)
    file = csv.DictReader(filename)
    Time = []
    Score = []

    for col in file:
        Time.append(col['Time'])
        Score.append(col['Score'])
    return [Time,Score]

def Normalize_Time(arr):
    temp =[]
    Inicio = float(arr[0])
    for element in arr:
        element = float(element)
        element = element - Inicio # START AT 0
        element = element/1000 #ms to s
        temp.append(element)
    return temp 
        
def Normalize_Score(arr):
    temp =[]
    for element in arr:
        element = float(element)
        temp.append(element)
    return temp 


if __name__ == "__main__" :
    #csv files: get_csv[0](RANDOM WALK) and get_csv[0](NO COLLISION)
    CSV_FileNames = get_csv()
    Random_Walk = csv_to_dict(CSV_FileNames[0])
    NO_Collision = csv_to_dict(CSV_FileNames[1])
    Random_Walk = [Normalize_Time(Random_Walk[0])  , Normalize_Score(Random_Walk[1]) ]
    NO_Collision = [Normalize_Time(NO_Collision[0])  ,  Normalize_Score(NO_Collision[1]) ]
    #print(Random_Walk[0])
    title = "SIMULATION "  + sys.argv[1][len(sys.argv[1])-1 ]
    pyplot.plot(Random_Walk[0], Random_Walk[1], color = 'green', label = 'Random Walk')
    pyplot.plot(NO_Collision[0], NO_Collision[1], color = 'red', label = 'No Collision')
    pyplot.xlabel('Time (s)')
    pyplot.ylabel('Score')
    pyplot.title(title)
    pyplot.legend(loc='upper left', frameon = True)
    pyplot.grid(True)
    pyplot.savefig(sys.argv[1] + "\\" +title +".jpg")
    pyplot.show()
    