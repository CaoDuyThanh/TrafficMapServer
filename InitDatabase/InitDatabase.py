import pdb
import xml.sax
import os
import os.path
import json
import time
import pymongo
from pymongo import MongoClient

# SETTING IS HERE
FILE_NAME_OSM = "Saigon.osm"

# DATABASE SETTING
client = MongoClient('mongodb://localhost:27017/')
db = client.TrafficMap #database name
global nodedict

class FindSegmentInCell:

	def __init__(cell):
		return

	def convertGPSToCellId(self, lon, lat):
		"""Input: real longtitude and latitude of GPS device return to System
	Output: cell_id after solve"""
		lon = int(lon * 100) + 18000
		lat = int(lat * 100) + 9000
		return lon << 16 | lat

	def convertAngleToCellId(self, lon, lat):
		"""Input: longtitude and latitude of a cell an convert it to cell_
	Output: cell_id after solve"""
		return lon << 16 | lat

	def mulTwoVector(self, PointX, PointY):
		return (self.ACToFlatE - self.ACToFlatS)*(PointX - self.ACToFlonS)-(self.ACToFlonE- self.ACToFlonS)*(PointY - self.ACToFlatS)

	def checkTrendOfPoint (self, lonOfCell, latOfCell):
		"""Input longitude and latitude of cell need to check
		Output return True is segment throw cell have codinate is lonOfCell latOfCell
		"""

		# lon lat after convert to float
		self.ACToFlonS = self.lonS * 100 + 18000
		self.ACToFlatS = self.latS * 100 + 9000
		self.ACToFlonE = self.lonE * 100 + 18000
		self.ACToFlatE = self.latE * 100 + 9000
			# check the line throw two point, start and end, interrupt as less 1 in 2 diagonal line of cell
		check1 = (self.mulTwoVector(lonOfCell, latOfCell) * self.mulTwoVector(lonOfCell+1, latOfCell+1))<0
		check2 = (self.mulTwoVector(lonOfCell+1, latOfCell) * self.mulTwoVector(lonOfCell, latOfCell+1))<0

		if (check1|check2):
			return True
		return False

	def findSegmetInCell(self, lonS, latS, lonE, latE):
		self.lonS = lonS
		self.latS = latS
		self.lonE = lonE
		self.latE = latE

			# longitude and latitude after convert to know cell contain the start point and end point
		AClonS = int(self.lonS * 100) + 18000#tuong duoi voi x diem dau
		AClatS = int(self.latS * 100) + 9000#tuong duoi voi Y diem dau
		AClonE = int(self.lonE * 100) + 18000#tuong duoi voi x diem cuoi
		AClatE = int(self.latE * 100) + 9000#tuong duoi voi y diem cuoi

		if ((AClonS == AClonE) & (AClatS == AClatE) ):#check if both of point in a cell TH1
			# print("=======> 0 ")
			listCellid = []
			listCellid.append(self.convertGPSToCellId(self.lonS, self.latS))
			return listCellid
		else:#TH2
			if AClonS == AClonE and not AClatS == AClatE:#check if the segment throw the cells have same longitude
				# print("=======> 1 ")
				listCellid = []#initial is a empty list
				temp =0
				if AClatS < AClatE:
					temp = 1
				else:
					temp = -1
				AClatE += temp
				while not(AClatS == AClatE):
					listCellid.append(self.convertAngleToCellId(AClonS, AClatS))
					AClatS +=temp
				return listCellid
			else:
				if not AClonS == AClonE and AClatS == AClatE:#check if the segment throw the cells have same latitude
					# print("=======> 2 ")
					listCellid = []#initial is a empty list
					temp =0
					if AClonS < AClonE:
						temp = 1
					else:
						temp = -1
					AClonE += temp
					while not(AClonS == AClonE):
						listCellid.append(self.convertAngleToCellId(AClonS, AClatS))
						AClonS +=temp
					return listCellid
				else:# check when two point difference coloumn and row TH3
					# print("=======> 3 ")
					listCellid = []#initial is a empty list
					tempLon =0
					if AClonS < AClonE:
						tempLon = 1
					else:
						tempLon = -1

					tempLat =0
					if AClatS < AClatE:
						tempLat = 1
					else:
						tempLat = -1
					AClonE += tempLon
					AClatE += tempLat
					while not(AClonS == AClonE):
						AClatS=int(latS * 100) + 9000
						while not(AClatS == AClatE):
							if self.checkTrendOfPoint (AClonS, AClatE):
								listCellid.append(self.convertAngleToCellId(AClonS, AClatS))
							AClatS +=tempLat
						AClonS +=tempLon
					return listCellid

class OSMContentHandler(xml.sax.ContentHandler):
	FLAG_NONE = -1
	FLAG_NODE = 1
	FLAG_WAY = 2

	def __init__(self):
		xml.sax.ContentHandler.__init__(self)
		self.nodes = []
		self.ways = []
		self.way = []
		self.flag = self.FLAG_NONE

	def startElement(self, name, attrs):

		if name == "bounds":
			self.minlat = float(attrs.getValue("minlat"))
			self.minlon = float(attrs.getValue("minlon"))
			self.maxlat = float(attrs.getValue("maxlat"))
			self.maxlon = float(attrs.getValue("maxlon"))

		elif name == "node":
			self.flag = self.FLAG_NODE
			id = int(attrs.getValue("id"))
			lat = float(attrs.getValue("lat"))
			lon = float(attrs.getValue("lon"))
			self.nodes.append([id, lat, lon])

		elif name == "way":
			self.flag = self.FLAG_WAY
			self.way = []
			self.way.append(int(attrs.getValue("id")))# street_id
			self.way.append([])
			self.way.append("")

		elif name == "nd":
			self.way[1].append(int(attrs.getValue("ref")))

		elif name == "tag":
			if self.flag == self.FLAG_WAY:
				if attrs.getValue("k") == "highway":
					self.way[2] = attrs.getValue("v")
				elif attrs.getValue("k") == "name":
					self.way.append(attrs.getValue("v"))

	def endElement(self, name):
		if name == "way":
			self.flag = self.FLAG_NONE
			if self.way[2] != "":
				self.ways.append(self.way)
		elif name == "node":
			self.flag = self.FLAG_NONE

def writeNodeFile(handler):
	if os.path.exists("nodes.json") and os.path.isfile("nodes.json"):
		return

	nodeFile = open("nodes.json", "wrb+")
	nodeFile.write("[")

	for i in xrange(len(handler.nodes)):
		node = handler.nodes[i]
		nodedict[node[0]] = [node[1],node[2]]
		json.dump({
					'node_id': node[0], 
					'lat': node[1] , 
					'lon': node[2]},  
				nodeFile, indent=3)
		nodeFile.write(",")
		nodeFile.write("\n")
	nodeFile.seek(-2, os.SEEK_END)
	nodeFile.truncate()
	nodeFile.write("]")
	nodeFile.close()

# find location of node(longitude and latitude) from node collections
# input node_id
# ouput longitude and latitude
def findlocationnode(node_id):
	return (nodedict[node_id][0],nodedict[node_id][1])

#Updated version by vuthede in 8:00 11/5/2016
#Content :Insert directly "node", "cell", "street" into mongodb
#		 Export "segment" into .json file, and then import into mongodb   
def writeStreetAndSegmentFile(handler):
	segmentdict = {}
	celldict = {}
	streetdict = {}
	segmentFile = open("segments.json", "wrb+")
	segmentFile.write("[")
	cellFile = open("cells.json", "wrb+")
	cellFile.write("[")
	streetFile = open("streets.json", "wrb+")
	streetFile.write("[")
	for i in xrange(len(handler.ways)):
		nextSegment = 0
		way = handler.ways[i]
		for j in xrange(len(way[1]) - 1):
			cell_id=[]
			street_id = way[0]
			street_type = way[2]
			if len(way)==4:
				street_name = way[3]
			else:
				street_name = ''
			segmentID = street_id << 16 | nextSegment
			segmentdict[segmentID] = street_id;
			node_start = findlocationnode(way[1][j])
			node_end = findlocationnode(way[1][j+1])
			listcell_id = FindSegmentInCell().findSegmetInCell(float(node_start[1]),
															   float(node_start[0]),
															   float(node_end[1]),
															   float(node_end[0]));
			json.dump({
				    'segment_id': segmentID,
				    'node_start': way[1][j], 
				   	'node_end': way[1][j+1],
				   	'density': 0,
				   	'velocity': 0,
				   	'timestamp': long(time.time()),
				   	'num_cell': len(listcell_id),
				   	'cells': listcell_id,
				   	'street_id': street_id
				}, segmentFile, indent=4)
			segmentFile.write(",")
			segmentFile.write("\n")

			for cell in listcell_id:
				if celldict.get(cell,None) is None:
					celldict[cell] = [segmentID]
				else:
					celldict[cell].append(segmentID)
			nextSegment += 1
			if streetdict.get(street_id,None) is None:
				temp = [[segmentID],street_type,nextSegment,street_name]
				streetdict[street_id] = temp
			else:
				streetdict[street_id][0].append(segmentID)
				streetdict[street_id][2] = nextSegment
	for element in celldict:
		streetTypes = {};
		for segmentId in celldict[element]:
			streetId = segmentdict[segmentId]
			street = streetdict[streetId]
			streetType = street[1]
			if streetTypes.get(streetType,None) is None:
				streetTypes[streetType] = [segmentId]
			else:
				streetTypes[streetType].append(segmentId);
		json.dump({
					'cell_id': element, 
					'num_segment': len(celldict[element]),
					'segments': celldict[element],
					'street_type': streetTypes
				}, cellFile, indent = 2)
		cellFile.write(",")
		cellFile.write("\n")
	for element in streetdict:
		# if len(streetdict[element])==3:
		json.dump({
					'street_id': element, 
					'name':streetdict[element][3],
					'type':streetdict[element][1],
					'num_segment': len(streetdict[element][0]),
					'segments':streetdict[element][0], 
					'next_segment':streetdict[element][2]
				}, streetFile, indent = 5)
		# else:
		# 	json.dump({'street_id': element, 'segments':streetdict[element][0], 'type':streetdict[element][1],'nextSegment':streetdict[element][2],'name':''}, streetFile, indent = 5)
		streetFile.write(",")
		streetFile.write("\n")

	segmentFile.seek(-2, os.SEEK_END)
	segmentFile.truncate()
	segmentFile.write("]")
	segmentFile.close()
	cellFile.seek(-2, os.SEEK_END)
	cellFile.truncate()
	cellFile.write("]")
	cellFile.close()
	streetFile.seek(-2, os.SEEK_END)
	streetFile.truncate()
	streetFile.write("]")
	streetFile.close()

if __name__ == "__main__":
	source = open(FILE_NAME_OSM)
	handler = OSMContentHandler()
	xml.sax.parse(source, handler)
	source.close()
	nodedict = {}
	writeNodeFile(handler)
	writeStreetAndSegmentFile(handler)

	# DROP OLD DATABASE
	mongo = pymongo.MongoClient('localhost', 27017)
	collection = mongo['TrafficMap']['nodes']
	collection.drop();
	collection = mongo['TrafficMap']['segments']
	collection.drop();
	collection = mongo['TrafficMap']['cells']
	collection.drop();
	collection = mongo['TrafficMap']['streets']
	collection.drop();
	
	# IMPORT DATA TO DATABASE
	os.system('mongoimport --db TrafficMap --collection nodes --file nodes.json --jsonArray')
	os.system('mongoimport --db TrafficMap --collection segments --file segments.json --jsonArray')
	os.system('mongoimport --db TrafficMap --collection cells --file cells.json --jsonArray')
	os.system('mongoimport --db TrafficMap --collection streets --file streets.json --jsonArray')

	# SET INDEX
	mongo = pymongo.MongoClient('localhost', 27017)
	collection = mongo['TrafficMap']['nodes']
	collection.ensure_index('node_id', unique=True)
	collection = mongo['TrafficMap']['segments']
	collection.ensure_index('segment_id', unique=True)
	collection = mongo['TrafficMap']['cells']
	collection.ensure_index('cell_id', unique=True)
	collection = mongo['TrafficMap']['streets']
	collection.ensure_index('street_id', unique=True)
