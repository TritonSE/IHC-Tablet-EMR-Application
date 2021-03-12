import csv
import json
from collections import defaultdict

# heights
hcsvfile = open('statage.csv', 'r')
hboysjson = open('boys_heights.json', 'w')
hgirlsjson = open('girls_heights.json', 'w')

# weights
wcsvfile = open('wtage.csv', 'r')
wboysjson = open('boys_weights.json', 'w')
wgirlsjson = open('girls_weights.json', 'w')

# infant heights
infant_hcsvfile = open('infantlength.csv', 'r')
infant_hboysjson = open('infant_boys_heights.json', 'w')
infant_hgirlsjson = open('infant_girls_heights.json', 'w')

# infant weights
infant_wcsvfile = open('infantweight.csv', 'r')
infant_wboysjson = open('infant_boys_weights.json', 'w')
infant_wgirlsjson = open('infant_girls_weights.json', 'w')

def convert(row):
    data = {}
    for k in row.keys():
        data[k] = float(row[k])
    return data

def extractPoints(data, boyObj, girlObj):
    if data["Sex"] == 1:
        obj = boyObj
    else:
        obj = girlObj
    obj["P3"].append([data["Agemos"], data["P3"]])
    obj["P5"].append([data["Agemos"], data["P5"]])
    obj["P10"].append([data["Agemos"], data["P10"]])
    obj["P25"].append([data["Agemos"], data["P25"]])
    obj["P50"].append([data["Agemos"], data["P50"]])
    obj["P75"].append([data["Agemos"], data["P75"]])
    obj["P90"].append([data["Agemos"], data["P90"]])
    obj["P95"].append([data["Agemos"], data["P95"]])
    return

def do(csvfile, boysjson, girlsjson):
    # infant length fieldnames are different
    infant_length_fieldnames = ("Sex", "Agemos", "L", "M", "S", "P3", "P5", "P10", \
                    "P25", "P50", "P75", "P90", "P95", "P97", "Pub3", "Pub5", \
                    "Pub10", "Pub25","Pub50","Pub75","Pub90","Pub95","Pub97", \
                    "Diff3","Diff5","Diff10","Diff25","Diff50","Diff75","Diff90", \
                    "Diff95","Diff97")
    fieldnames = ("Sex", "Agemos", "L", "M", "S", "P3", "P5", "P10", "P25", "P50", \
            "P75", "P90", "P95", "P97")
    # Sample 1/skipFactor points by skipping other rows
    skipFactor = 8
    # use other fieldnames, skip less rows for infants
    if csvfile == infant_hcsvfile:
        fieldnames = infant_length_fieldnames
    if csvfile == infant_hcsvfile or csvfile == infant_wcsvfile:
        skipFactor = 1
    reader = csv.DictReader(csvfile, fieldnames)
    boysCount = 0 # count of rows (months)
    girlsCount = 0
    boyDone = 0
    girlDone = 0
    # the return objs
    boyObj = defaultdict(list)
    girlObj = defaultdict(list)
    for row in reader:
        data = convert(row)
        if data["Sex"] == 1:
            boysCount = boysCount + 1
            if not boysCount % skipFactor == 0:
                continue
        else:
            girlsCount = girlsCount + 1
            if not girlsCount % skipFactor == 0:
                continue
        points = extractPoints(data, boyObj, girlObj)
        # temps to clear first row without comma
    json.dump(girlObj, girlsjson)
    json.dump(boyObj, boysjson)

do(hcsvfile, hboysjson, hgirlsjson)
do(wcsvfile, wboysjson, wgirlsjson)
do(infant_hcsvfile, infant_hboysjson, infant_hgirlsjson)
do(infant_wcsvfile, infant_wboysjson, infant_wgirlsjson)
