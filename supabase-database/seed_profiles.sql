
CREATE OR REPLACE FUNCTION seed_profiles(
    p_count INTEGER DEFAULT 20,
    p_min_grad_year INTEGER DEFAULT 2018,
    p_max_grad_year INTEGER DEFAULT 2026,
    p_include_unverified BOOLEAN DEFAULT FALSE,
    p_include_admins BOOLEAN DEFAULT FALSE,
    p_seed INTEGER DEFAULT NULL
)
RETURNS TABLE(inserted_count INTEGER, sample_emails TEXT[]) 
LANGUAGE plpgsql
AS $$
DECLARE
    -- State-City mappings (geographically accurate Indian pairs)
     state_city_map TEXT[][] := ARRAY[
        ARRAY['Delhi', 'New Delhi', 'Dwarka', 'Rohini', 'Janakpuri', 'Connaught Place', '', ''],
        ARRAY['Haryana', 'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', ''],
        ARRAY['Punjab', 'Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali', ''],
        ARRAY['Uttar Pradesh', 'Lucknow', 'Noida', 'Kanpur', 'Agra', 'Varanasi', 'Ghaziabad', 'Prayagraj'],
        ARRAY['Uttarakhand', 'Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Mussoorie', '', ''],
        ARRAY['Himachal Pradesh', 'Shimla', 'Dharamshala', 'Manali', 'Solan', 'Kullu', '', ''],
        ARRAY['Jammu and Kashmir', 'Srinagar', 'Jammu', 'Leh', 'Anantnag', '', '', ''],
        ARRAY['Maharashtra', 'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Navi Mumbai'],
        ARRAY['Gujarat', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', ''],
        ARRAY['Rajasthan', 'Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar'],
        ARRAY['Goa', 'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', '', '', ''],
        ARRAY['Karnataka', 'Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga', ''],
        ARRAY['Kerala', 'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', ''],
        ARRAY['Tamil Nadu', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', ''],
        ARRAY['Telangana', 'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', '', ''],
        ARRAY['Andhra Pradesh', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada', '', ''],
        ARRAY['West Bengal', 'Kolkata', 'Siliguri', 'Durgapur', 'Asansol', 'Howrah', 'Darjeeling', ''],
        ARRAY['Odisha', 'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Puri', '', ''],
        ARRAY['Jharkhand', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', '', ''],
        ARRAY['Bihar', 'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', '', ''],
        ARRAY['Assam', 'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', '', ''],
        ARRAY['Madhya Pradesh', 'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa'],
        ARRAY['Chhattisgarh', 'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', '', '']
    ];
    
    -- Curated Male First Names (diverse, no repetition)
    first_names_male TEXT[] := ARRAY[
        'Aarav','Aarush','Advik','Agastya','Ahan','Arjun','Arnav','Atharv','Ayaan','Ayush',
        'Darsh','Dhruv','Dhyan','Haarvik','Hardik','Ishaan','Jai','Kabir','Krish','Krishna',
        'Kunal','Laksh','Manav','Mayank','Mohit','Nakul','Naman','Neel','Ojas','Om',
        'Parth','Pranav','Prateek','Prithvi','Reyansh','Rohan','Rudra','Sahil','Samar','Samarth',
        'Sameer','Sanjay','Sarthak','Shivam','Shivansh','Siddharth','Tanay','Tanishq','Vedant','Vivaan',
        'Vihaan','Vikram','Yash','Yuvan','Zain','Aadi','Aaditya','Aariz','Abhay','Adhiraj',
        'Adinath','Adit','Aditya','Advait','Ahaan','Aidan','Ajay','Ajit','Akash','Akhil',
        'Aksh','Akshat','Akshay','Aman','Amartya','Amit','Amogh','Anay','Aniket','Anirudh',
        'Anish','Ankit','Anmol','Ansh','Anshul','Antariksh','Arhaan','Armaan','Arpit','Arsh',
        'Arth','Arush','Aryaman','Aryan','Ashish','Ashwin','Atul','Ayaansh','Ayansh','Azad',
        'Bhavesh','Bhavya','Bhuvan','Chetan','Chirag','Danish','Darshan','Deepak','Dev','Devansh',
        'Deven','Dhairya','Dhanush','Dharmik','Dhruva','Divij','Divit','Divyansh','Ehsaan','Ekansh',
        'Ekaveer','Elaksh','Emir','Eshan','Fahad','Farhan','Gagan','Gaurav','Gautam','Girish',
        'Gokul','Gopal','Govind','Guneet','Gurjas','Gurnoor','Hans','Harsh','Harshit','Harshvardhan',
        'Hemant','Hriday','Hrishikesh','Hunar','Ishir','Ishmeet','Ishpreet','Ivan','Jahan','Jaiaditya',
        'Jaideep','Jaimin','Jaisal','Jaiyesh','Jasraj','Jatin','Jayant','Jeevan','Jigar','Jivin',
        'Jivitesh','Johan','Jubin','Jugal','Juspreet','Kailash','Karan','Kartik','Kartikeya','Kavin',
        'Keshav','Ketan','Keyur','Kiaan','Kiran','Kishan','Kishore','Kritagya','Kush','Kushal',
        'Lakshya','Lalit','Lav','Lavya','Lohit','Luv','Madhav','Mahir','Mahit','Manan',
        'Manas','Manish','Manit','Mannat','Manthan','Mantra','Manvik','Mayur','Medhansh','Mehul',
        'Mihir','Mihit','Miraan','Mishkat','Mithil','Mohan','Moksh','Mukul','Munish','Nachiket',
        'Namit','Nandish','Narayan','Naren','Narendra','Naveen','Navin','Navneet','Navya','Neal',
        'Neeraj','Nehal','Niketan','Nikhil','Nilesh','Nilay','Nimesh','Nirav','Nirmal','Nishant',
        'Nishith','Nitesh','Nitin','Nivan','Nivesh','Ojasvi','Omkaar','Onkar','Oshin','Oviyan',
        'Padmanabh','Parakram','Param','Paras','Parikshit','Parthiv','Parv','Pavan','Pavith','Piush',
        'Prabal','Prabhat','Prabhu','Pradeep','Pradip','Pradyumna','Prajwal','Prakhar','Pranay','Pranil',
        'Pranshu','Pratham','Prathamesh','Pratik','Pratyush','Prayaan','Prayag','Prayukth','Prem','Prerak',
        'Prish','Pritam','Priyam','Priyansh','Priyanshu','Pulkit','Puneet','Purab','Puran','Purav',
        'Purv','Pushkar','Raaghav','Raahil','Raahul','Rachit','Radhakrishnan','Radhey','Raghav','Raghavendra',
        'Raghuram','Raghuveer','Raghu','Rahul','Raian','Rajat','Rajdeep','Rajeev','Rajesh','Rajiv',
        'Rajneesh','Rajvardhan','Rakshit','Raman','Ramesh','Ranbir','Ranjan','Ranveer','Ranvijay','Ranvir',
        'Rashid','Ratan','Ratnakar','Ravi','Ravinder','Ravindra','Rehan','Reyav','Rian','Ribhav',
        'Riddhiman','Ridhansh','Rihan','Rishabh','Rishav','Rishik','Rishikesh','Rishit','Rishith','Rishvanth',
        'Ritvik','Rivaan','Rivan','Ronit','Roshan','Rudransh','Rudraksh','Ruhan','Rushil','Rutvik',
        'Ryaan','Ryan','Saanv','Saanvik','Saarth','Sachin','Sadhav','Sahaj','Sahan','Sahishnu',
        'Sai','Saiyan','Sajal','Saket','Samarjeet','Samay','Samer','Samir','Samrat','Samyak',
        'Sanatan','Sanchit','Sandesh','Sandeep','Sandip','Sanjeev','Sankalp','Sanket','Sannidh','Sanskar',
        'Santosh','Sanyam','Sapan','Saqib','Sarang','Sarvesh','Sashank','Saurabh','Saurav','Savan',
        'Savio','Sayak','Sayam','Sayantan','Sayem','Sehaj','Shaurya','Shayak','Shekhar','Shiv',
        'Shivay','Shivendra','Shivraj','Shivanshu','Shlok','Shourya','Shrey','Shreyan','Shreyansh','Shreyash',
        'Shrihan','Shrihaan','Shriyansh','Shubh','Shubham','Shubhranshu','Shudhanshu','Shuvan','Shuvam','Shwet',
        'Siddh','Siddhant','Siddhesh','Siddhivinayak','Sidharth','Sihab','Sijan','Silas','Simar','Simran',
        'Sinan','Smaran','Smarth','Soham','Sohan','Sohil','Sohum','Sohail','Somesh','Somya',
        'Sourabh','Sourav','Souvik','Sparsh'
    ];
    
    -- Curated Female First Names (diverse, no repetition)
    first_names_female TEXT[] := ARRAY[
        'Aadhya','Aahana','Aarna','Aarohi','Aarya','Aavya','Abha','Abhigna','Abhaya','Abhilasha',
        'Abhirami','Abhishta','Adah','Adalini','Adalja','Adalyn','Adara','Addy','Adhira','Adhriti',
        'Adhyaa','Adhya','Adhiti','Adhrija','Adira','Aditi','Adya','Ahaana','Ahanika','Ahana',
        'Aheli','Aishani','Aishwarya','Aiva','Aiyana','Aiza','Ajita','Akanksha','Akansha','Akira',
        'Akriti','Akshara','Akshita','Alia','Alina','Alisha','Alka','Alpana','Amaira','Amala',
        'Amaya','Ambika','Amrita','Anagha','Anahita','Anandi','Ananya','Anaya','Anika','Anisha',
        'Anjali','Ankita','Anmol','Anna','Anoushka','Anshika','Anshu','Anushka','Anvi','Anya',
        'Aparna','Aradhya','Arpita','Arshi','Arya','Aryahi','Asha','Ashlesha','Ashmita','Ashna',
        'Ashrita','Asmi','Astha','Athira','Atulya','Avani','Avni','Ayana','Ayushi','Bhagya',
        'Bhakti','Bhavna','Bhumika','Charu','Chhaya','Damini','Darshana','Deepa','Deepika','Deepti',
        'Devika','Dhara','Dhatri','Dhriti','Diya','Divya','Eesha','Ekta','Elina','Esha',
        'Falguni','Gargi','Garima','Gayatri','Gita','Hamsa','Hansa','Harini','Harita','Heena',
        'Hema','Himani','Hira','Ila','Indira','Indu','Ira','Ishani','Ishita','Ishna',
        'Jahnvi','Jaya','Jayanti','Jhanvi','Jiya','Kajal','Kalyani','Kamini','Kanchan','Kanika',
        'Kanya','Kashvi','Kavita','Kavya','Keshvi','Khushi','Kiran','Kirti','Komal','Kriti',
        'Kritika','Kumari','Kusum','Lavanya','Leela','Lekha','Lina','Lipi','Lisha','Liza',
        'Madhavi','Madhu','Mahi','Mahika','Mahima','Maithili','Mala','Malini','Manasi','Manisha',
        'Manju','Manjula','Mansi','Meenakshi','Meera','Megha','Meghana','Mira','Mitali','Mithila',
        'Mona','Mrinalini','Mridula','Mrunal','Mudita','Naina','Nalini','Namita','Nandini','Nandita',
        'Navya','Neha','Nehal','Neela','Neelam','Neeraja','Nehmat','Nidhi','Nikita','Nimisha',
        'Nirali','Nisha','Nishita','Nitya','Nivedita','Ojasvi','Omisha','Oorja','Pallavi','Pankhuri',
        'Pari','Paridhi','Parinaaz','Parinita','Parijat','Parnika','Parul','Pavani','Pavitra','Payal',
        'Pooja','Poonam','Prachi','Pragya','Prajakta','Pranavi','Pranaya','Pranjal','Prapti','Prarthana',
        'Pratibha','Pratima','Prerna','Preeti','Preksha','Priya','Priyanka','Priyanshi','Priyanshu','Purnima',
        'Pushpa','Radha','Radhika','Ragini','Rajni','Rajshree','Ramya','Rashi','Rashmi','Ratna',
        'Raveena','Ravina','Reena','Rekha','Rhea','Riddhi','Riddhima','Riya','Rohini','Roshni',
        'Ruchi','Rukmini','Rutuja','Saachi','Saadhana','Saakshi','Saara','Saanvi','Saanya','Saanvika',
        'Sadhana','Sadhvi','Sahana','Saheli','Sai','Saisha','Sakshi','Saloni','Samaira','Samanvi',
        'Samara','Sameera','Samiksha','Sanjana','Sanskriti','Sanya','Sapna','Sara','Sarika','Sarita',
        'Sarnia','Saswati','Satya','Savita','Seema','Shailaja','Shalini','Shamita','Shanaya','Shanvi',
        'Sharda','Sharmila','Shashi','Shreya','Shreeja','Shrestha','Shruti','Shubha','Shubhangi','Shweta',
        'Siddhi','Simran','Sindhu','Sneha','Snehal','Sonia','Soumya','Sravani','Sreeja','Sriya',
        'Stuti','Subhadra','Suchitra','Sudha','Sujata','Sukriti','Sumana','Sumedha','Sumitra','Sunaina',
        'Sunita','Supriya','Surabhi','Suruchi','Sushma','Sveta','Swara','Swati','Swetha','Tanya',
        'Tara','Tarini','Tejasvi','Trisha','Trupti','Tulsi','Tushita','Ujjwala','Umang','Uma',
        'Urmi','Urmila','Urvi','Vaani','Vaidehi','Vaishali','Vaishnavi','Vandana','Varsha','Vasudha',
        'Veda','Vedika','Vidhi','Vidya','Vijaya','Vinita','Vipasha','Vira','Vishakha','Vishaka'
    ];
    
    -- Last Names (common Indian surnames)
    last_names TEXT[] := ARRAY[
        'Sharma','Verma','Gupta','Singh','Patel','Kumar','Reddy','Nair','Iyer','Menon',
        'Desai','Shah','Kapoor','Malhotra','Khanna','Bansal','Mittal','Jain','Chopra','Sethi',
        'Bhatia','Arora','Pandey','Dubey','Kulkarni','Banerjee','Deshpande','Das','Joshi','Rao',
        'Pillai','Menon','Nambiar','Hegde','Shetty','Bhat','Raj','Roy','Chatterjee','Mukherjee',
        'Bose','Ghosh','Sengupta','Dasgupta','Bhattacharya','Chakraborty','Mandal','Sarkar','Pal','Dutta',
        'Sinha','Thakur','Yadav','Rana','Rathore','Chauhan','Tomar','Parmar','Solanki','Vyas',
        'Trivedi','Dave','Mehta','Acharya','Bhatt','Pandya','Shukla','Tiwari','Mishra','Srivastava',
        'Agrawal','Aggarwal','Bansal','Garg','Goel','Jindal','Khandelwal','Maheshwari','Singhal','Tiwari',
        'Upadhyay','Pathak','Bhardwaj','Chauhan','Rajput','Thakkar','Parikh','Mehta','Shah','Patel',
        'Desai','Joshi','Kulkarni','Pawar','Jadhav','More','Shinde','Patil','Gaikwad','Bhosale',
        'Kadam','Salunkhe','Sawant','Naik','Nikam','Jagtap','Ghadge','Shelke','Kale','Thorat',
        'Bhosle','Gokhale','Kulkarni','Deshmukh','Kulkarni','Joshi','Bapat','Kulkarni','Kulkarni','Kulkarni'
    ];
    
    -- Colleges/Universities
    colleges TEXT[] := ARRAY[
        'IIT Delhi','IIT Bombay','IIT Madras','IIT Kanpur','IIT Kharagpur','IIT Roorkee','IIT Guwahati',
        'IIT Hyderabad','IIT Indore','IIT Gandhinagar','IIT Ropar','IIT Mandi','IIT Palakkad','IIT Jammu',
        'IIM Ahmedabad','IIM Bangalore','IIM Calcutta','IIM Lucknow','IIM Kozhikode','IIM Indore','IIM Shillong',
        'BITS Pilani','BITS Goa','BITS Hyderabad','NIT Trichy','NIT Surathkal','NIT Warangal','NIT Calicut',
        'NIT Rourkela','NIT Durgapur','NIT Jaipur','NIT Kurukshetra','NIT Allahabad','Manipal University',
        'VIT Vellore','VIT Chennai','SRM University','Amity University','JNU','DU','Jamia Millia Islamia',
        'Aligarh Muslim University','Banaras Hindu University','University of Hyderabad','Jadavpur University',
        'Anna University','COEP Pune','ICT Mumbai','IIIT Hyderabad','IIIT Bangalore','IIIT Delhi','IIIT Allahabad',
        'Thapar University','Lovely Professional University','Christ University','Symbiosis','NMIMS','SP Jain',
        'XLRI Jamshedpur','MDI Gurgaon','SPJIMR Mumbai','FMS Delhi','IIFT Delhi','NIFT Delhi','NID Ahmedabad'
    ];
    
    -- Bio variations organized by theme
    bio_themes TEXT[][] := ARRAY[
        -- Academic/Career focused
        ARRAY['Engineering student focused on core subjects.','Aspiring data scientist exploring AI/ML.',
              'Research enthusiast in physics and math.','Computer Science major passionate about algorithms.',
              'Mechanical engineering with interest in robotics.','Electronics student building IoT projects.',
              'Civil engineering focused on sustainable infrastructure.','Chemical engineering exploring green tech.',
              'Biotechnology student researching healthcare solutions.','Aerospace enthusiast dreaming of space tech.'],
        -- Creative/Personal interests
        ARRAY['Love exploring new cultures and coding.','Creative writer & full-stack developer.',
              'Balancing sports, music, and academics.','Photography enthusiast capturing life moments.',
              'Travel blogger documenting Indian heritage.','Foodie exploring regional cuisines across India.',
              'Classical dancer learning contemporary fusion.','Music producer blending traditional and modern sounds.',
              'Artist experimenting with digital mediums.','Poet finding words in code and chaos.'],
        -- Growth/Learning mindset
        ARRAY['Always learning something new every day.','Curious mind exploring interdisciplinary connections.',
              'Building skills in tech, design, and leadership.','Lifelong learner passionate about personal growth.',
              'Exploring the intersection of technology and society.','Documenting my journey from student to professional.',
              'Sharing knowledge through blogs and open source.','Mentoring juniors while learning from seniors.',
              'Building projects that solve real-world problems.','Turning ideas into impactful solutions.'],
        -- Entrepreneurial/Ambitious
        ARRAY['Future entrepreneur building startups.','Aspiring product manager with startup experience.',
              'Building tech solutions for social impact.','Exploring venture capital and innovation ecosystems.',
              'Startup enthusiast with two successful prototypes.','Product thinker focused on user-centric design.',
              'Growth hacker experimenting with digital marketing.','Business student with tech startup internships.',
              'Social entrepreneur working on education access.','Sustainability advocate building green businesses.'],
        -- Tech/Developer focused
        ARRAY['Full-stack developer building scalable apps.','Open-source contributor passionate about community.',
              'Mobile app developer focused on UX/UI.','Backend engineer optimizing distributed systems.',
              'Frontend specialist creating beautiful interfaces.','DevOps enthusiast automating deployment pipelines.',
              'AI/ML researcher exploring neural networks.','Cybersecurity student protecting digital futures.',
              'Cloud architect designing resilient systems.','Data engineer building robust ETL pipelines.'],
        -- General/Relatable
        ARRAY['Just a student navigating college life.','Coffee enthusiast and code debugger.',
              'Weekend hiker, weekday coder.','Book lover with a growing tech library.',
              'Gaming enthusiast who also studies sometimes.','Fitness journey: one commit at a time.',
              'Trying to adult while building cool stuff.','Professional overthinker, amateur developer.',
              'Making mistakes and learning from them.','Building my future one line of code at a time.']
    ];
    
    -- Email domain options (mostly gmail as per requirement)
    email_domains TEXT[] := ARRAY['gmail.com','yahoo.com','outlook.com','icloud.com','protonmail.com'];
    
    -- Variables for loop
    i INTEGER;
    profile_id UUID;
    first_name TEXT;
    last_name TEXT;
    full_name TEXT;
    username TEXT;
    gender TEXT;
    email_local TEXT;
    email_domain TEXT;
    email_suffix TEXT;
    email TEXT;
    avatar_url TEXT;
    bio TEXT;
    college TEXT;
    grad_year INTEGER;
    state TEXT;
    city TEXT;
    created_at TIMESTAMPTZ;
    updated_at TIMESTAMPTZ;
    is_verified BOOLEAN;
    is_admin BOOLEAN;
    is_blocked BOOLEAN;
    location_idx INTEGER;
    city_idx INTEGER;
    bio_theme_idx INTEGER;
    bio_idx INTEGER;
    sample_email_list TEXT[] := ARRAY[]::TEXT[];
    
BEGIN
    -- Ensure pgcrypto extension for UUID generation
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    
    -- Set seed for reproducibility if provided
    IF p_seed IS NOT NULL THEN
        PERFORM setseed(p_seed::FLOAT / 2147483647);
    END IF;
    
    FOR i IN 1..p_count LOOP
        -- Generate unique UUID
        profile_id := gen_random_uuid();
        
        -- Randomly select gender and corresponding first name
        IF random() < 0.52 THEN  -- Slight male bias to match example distribution
            gender := 'male';
            first_name := first_names_male[floor(random() * array_length(first_names_male, 1)) + 1];
        ELSE
            gender := 'female';
            first_name := first_names_female[floor(random() * array_length(first_names_female, 1)) + 1];
        END IF;
        
        -- Select last name
        last_name := last_names[floor(random() * array_length(last_names, 1)) + 1];
        full_name := first_name || ' ' || last_name;
        
        -- Generate username: firstname.lastname-<first 6 chars of uuid in lowercase>
        username := LOWER(first_name || '.' || last_name || '-' || SUBSTRING(profile_id::TEXT, 1, 6));
        
        -- Generate proper email with variations matching example pattern
        email_local := LOWER(first_name || '.' || last_name);
        
        -- Add numeric suffix 35% of the time (matching example pattern)
        IF random() < 0.35 THEN
            email_suffix := floor(random() * 9 + 1)::TEXT;
            email_local := email_local || email_suffix;
        END IF;
        
        -- Mostly gmail.com (90%), occasionally other domains
        IF random() < 0.90 THEN
            email_domain := 'gmail.com';
        ELSE
            email_domain := email_domains[floor(random() * array_length(email_domains, 1)) + 1];
        END IF;
        
        email := email_local || '@' || email_domain;
        
        -- Generate avatar URL with DiceBear API using profile_id as seed
        avatar_url := 'https://api.dicebear.com/9.x/avataaars/svg?seed=' || profile_id || '&gender=' || gender;
        
        -- Select random bio from themed collections

        bio_theme_idx := floor(random() * array_length(bio_themes, 1)) + 1;
        bio_idx := floor(random() * array_length(bio_themes[bio_theme_idx:bio_theme_idx], 1)) + 1;
        bio := bio_themes[bio_theme_idx][bio_idx];
        -- Select college
        college := colleges[floor(random() * array_length(colleges, 1)) + 1];
        
        -- Generate graduation year within specified range
        grad_year := floor(random() * (p_max_grad_year - p_min_grad_year + 1)) + p_min_grad_year;
        
        -- Select state-city pair (geographically accurate)
         location_idx := floor(random() * array_length(state_city_map, 1)) + 1;
        state := state_city_map[location_idx][1];
        
        -- Use slice notation [location_idx:location_idx] to get the sub-array, then get its length
        -- We subtract 1 because index 1 is the State Name, so cities start at index 2
        city_idx := floor(random() * (array_length(state_city_map[location_idx:location_idx], 1) - 1)) + 2;
        
        -- Handle cases where padding empty strings might be selected (if random hits an empty slot)
        city := state_city_map[location_idx][city_idx];
        IF city = '' THEN
            -- Fallback to the first actual city (index 2) if empty string is picked
            city := state_city_map[location_idx][2];
        END IF;
        -- Generate realistic timestamps
        -- created_at: random date in past 1-3 years
        created_at := NOW() - (random() * INTERVAL '1095 days');
        -- updated_at: between created_at and now, usually within 30 days of created_at
        updated_at := created_at + (random() * INTERVAL '30 days');
        IF updated_at > NOW() THEN
            updated_at := NOW() - (random() * INTERVAL '1 day');
        END IF;
        
        -- Determine verification and admin status based on parameters
        IF p_include_unverified AND random() < 0.15 THEN
            is_verified := FALSE;
        ELSE
            is_verified := TRUE;
        END IF;
        
        IF p_include_admins AND random() < 0.05 THEN
            is_admin := TRUE;
        ELSE
            is_admin := FALSE;
        END IF;
        
        -- Most profiles are not blocked
        is_blocked := CASE WHEN random() < 0.02 THEN TRUE ELSE FALSE END;
        
        -- Insert the record with proper type casting
        INSERT INTO "public"."profiles" (
            "id", "username", "full_name", "avatar_url", "bio", 
            "current_college", "graduation_year", "state", "city", 
            "is_verified", "created_at", "updated_at", "gender", 
            "is_admin", "is_blocked", "email"
        ) VALUES (
            profile_id,
            username,
            full_name,
            avatar_url,
            bio,
            college,
            grad_year,
            state,
            city,
            is_verified,
            created_at,
            updated_at,
            gender,
            is_admin,
            is_blocked,
            email
        );
        
    END LOOP;
    
    -- Return results
    inserted_count := p_count;
    RETURN NEXT;
    
    RAISE NOTICE 'Successfully inserted % synthetic profiles', p_count;
    
END;
$$;

-- This will add 1000 random profiles to the profiles table
-- SELECT * FROM seed_profiles(1000);